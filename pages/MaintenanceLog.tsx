
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { MaintenanceIntervention, MaintenancePart, PreventivePlanItem } from '../types';
import { MaintenanceType } from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const MaintenanceForm: React.FC<{ onSave: () => void; intervention?: MaintenanceIntervention }> = ({ onSave, intervention }) => {
    const [type, setType] = useState<MaintenanceType>(intervention?.type || MaintenanceType.CORRETIVA);
    const [responsible, setResponsible] = useState(intervention?.responsible || '');
    const [description, setDescription] = useState(intervention?.description || '');
    const [partsUsed, setPartsUsed] = useState<string[]>(intervention?.partsUsed.split(',') || []);
    const [status, setStatus] = useState<'Aberta' | 'Fechada'>(intervention?.status || 'Aberta');
    const [startTime, setStartTime] = useState(new Date(intervention?.startTime || Date.now()).toISOString().slice(0, 16));
    
    const availableParts = useLiveQuery(() => db.maintenanceParts.toArray(), []);

    const handlePartSelect = (partName: string) => {
        if (!partsUsed.includes(partName)) {
            setPartsUsed([...partsUsed, partName]);
        }
    };

    const removePart = (partName: string) => {
        setPartsUsed(partsUsed.filter(p => p !== partName));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const interventionData: MaintenanceIntervention = {
            id: intervention?.id,
            type,
            responsible,
            description,
            partsUsed: partsUsed.join(','),
            status,
            startTime: new Date(startTime).getTime(),
            endTime: status === 'Fechada' ? Date.now() : 0,
        };
        if (intervention?.id) {
            await db.maintenanceInterventions.update(intervention.id, interventionData);
        } else {
            await db.maintenanceInterventions.add(interventionData);
        }
        onSave();
    };

    return (
        <Card title={intervention ? 'Editar Intervenção' : 'Registrar Intervenção de Manutenção'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select value={type} onChange={e => setType(e.target.value as MaintenanceType)} className="p-2 border rounded">
                        {Object.values(MaintenanceType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input type="text" placeholder="Responsável" value={responsible} onChange={e => setResponsible(e.target.value)} required className="p-2 border rounded" />
                    <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required className="p-2 border rounded" />
                     <select value={status} onChange={e => setStatus(e.target.value as 'Aberta'|'Fechada')} className="p-2 border rounded">
                        <option value="Aberta">Aberta</option>
                        <option value="Fechada">Fechada</option>
                    </select>
                </div>
                <textarea placeholder="Descrição do Serviço" value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-2 border rounded" />
                
                <div>
                    <label className="block font-medium mb-1">Peças Utilizadas</label>
                    <select onChange={e => handlePartSelect(e.target.value)} className="w-full p-2 border rounded mb-2">
                        <option>Selecione uma peça para adicionar...</option>
                        {availableParts?.map(part => <option key={part.id} value={part.name}>{part.name} ({part.code})</option>)}
                    </select>
                    <div className="flex flex-wrap gap-2">
                        {partsUsed.filter(p=>p).map(part => (
                            <div key={part} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                                <span>{part}</span>
                                <button type="button" onClick={() => removePart(part)} className="ml-2 text-red-500 font-bold">x</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit">Salvar</Button>
                </div>
            </form>
        </Card>
    );
};

const InterventionsList: React.FC<{ onNew: () => void }> = ({ onNew }) => {
    const interventions = useLiveQuery(() => db.maintenanceInterventions.orderBy('startTime').reverse().toArray(), []);
    return (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                        <th className="p-3">Data Início</th>
                        <th className="p-3">Tipo</th>
                        <th className="p-3">Responsável</th>
                        <th className="p-3">Descrição</th>
                        <th className="p-3">Peças</th>
                        <th className="p-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {interventions?.map(item => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">{new Date(item.startTime).toLocaleString()}</td>
                            <td className="p-3">{item.type}</td>
                            <td className="p-3">{item.responsible}</td>
                            <td className="p-3 truncate max-w-xs">{item.description}</td>
                            <td className="p-3 truncate max-w-xs">{item.partsUsed}</td>
                            <td className="p-3">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'Aberta' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                                    {item.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const PartsManager: React.FC = () => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const parts = useLiveQuery(() => db.maintenanceParts.toArray(), []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await db.maintenanceParts.add({ name, code });
        setName('');
        setCode('');
    };

    const handleDelete = async (id: number) => {
        if (confirm('Tem certeza que deseja remover esta peça?')) {
            await db.maintenanceParts.delete(id);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card title="Cadastrar Nova Peça">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Nome da Peça" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 border rounded" />
                    <input type="text" placeholder="Código/SKU" value={code} onChange={e => setCode(e.target.value)} required className="w-full p-2 border rounded" />
                    <Button type="submit" className="w-full">Adicionar Peça</Button>
                </form>
            </Card>
            <Card title="Peças Cadastradas">
                <ul className="space-y-2 h-64 overflow-y-auto">
                    {parts?.map(part => (
                        <li key={part.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span>{part.name} ({part.code})</span>
                            <Button variant="danger" size="sm" onClick={() => handleDelete(part.id!)}>Remover</Button>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
}

const PreventivePlanManager: React.FC = () => {
    const [task, setTask] = useState('');
    const [type, setType] = useState<MaintenanceType>(MaintenanceType.PREVENTIVA);
    const [frequencyDays, setFrequencyDays] = useState(30);

    const plans = useLiveQuery(() => db.preventivePlans.orderBy('nextDueDate').toArray(), []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newPlan: PreventivePlanItem = {
            task,
            type,
            frequencyDays,
            nextDueDate: Date.now() + frequencyDays * 24 * 60 * 60 * 1000,
        };
        await db.preventivePlans.add(newPlan);
        setTask('');
    };

    const handleMarkAsDone = async (plan: PreventivePlanItem) => {
        await db.preventivePlans.update(plan.id!, {
            lastDone: Date.now(),
            nextDueDate: Date.now() + plan.frequencyDays * 24 * 60 * 60 * 1000,
        });
    };

    return (
        <div>
             <Card title="Novo Item de Plano Preventivo" className="mb-8">
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                    <input type="text" placeholder="Tarefa de Manutenção" value={task} onChange={e => setTask(e.target.value)} required className="flex-grow p-2 border rounded" />
                    <select value={type} onChange={e => setType(e.target.value as MaintenanceType)} className="p-2 border rounded">
                        <option value={MaintenanceType.PREVENTIVA}>Preventiva</option>
                        <option value={MaintenanceType.PREDITIVA}>Preditiva</option>
                    </select>
                    <input type="number" placeholder="Frequência (dias)" value={frequencyDays} onChange={e => setFrequencyDays(Number(e.target.value))} required className="p-2 border rounded" />
                    <Button type="submit">Adicionar Plano</Button>
                </form>
            </Card>
            <Card title="Plano de Manutenção Preventiva">
                <table className="w-full text-sm text-left text-gray-700">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th className="p-3">Tarefa</th>
                            <th className="p-3">Frequência</th>
                            <th className="p-3">Última Execução</th>
                            <th className="p-3">Próxima Execução</th>
                            <th className="p-3">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plans?.map(plan => (
                             <tr key={plan.id} className="border-b hover:bg-gray-50">
                                 <td className="p-3">{plan.task}</td>
                                 <td className="p-3">{plan.frequencyDays} dias</td>
                                 <td className="p-3">{plan.lastDone ? new Date(plan.lastDone).toLocaleDateString() : 'N/A'}</td>
                                 <td className={`p-3 font-bold ${plan.nextDueDate < Date.now() ? 'text-red-500' : 'text-green-600'}`}>
                                     {new Date(plan.nextDueDate).toLocaleDateString()}
                                 </td>
                                 <td className="p-3"><Button size="sm" onClick={() => handleMarkAsDone(plan)}>Marcar como Feito</Button></td>
                             </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};


const MaintenanceLog: React.FC = () => {
    const [activeTab, setActiveTab] = useState('history'); // history, parts, plan
    const [showForm, setShowForm] = useState(false);

    const renderContent = () => {
        if (showForm) return <MaintenanceForm onSave={() => setShowForm(false)} />;

        switch (activeTab) {
            case 'history': return <InterventionsList onNew={() => setShowForm(true)} />;
            case 'parts': return <PartsManager />;
            case 'plan': return <PreventivePlanManager />;
            default: return <InterventionsList onNew={() => setShowForm(true)} />;
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Módulo de Manutenção</h1>
                {activeTab === 'history' && <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Ver Histórico' : 'Nova Intervenção'}</Button>}
            </div>

            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setActiveTab('history')} className={`py-2 px-1 border-b-2 font-medium text-lg ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Histórico</button>
                    <button onClick={() => setActiveTab('parts')} className={`py-2 px-1 border-b-2 font-medium text-lg ${activeTab === 'parts' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Cadastro de Peças</button>
                    <button onClick={() => setActiveTab('plan')} className={`py-2 px-1 border-b-2 font-medium text-lg ${activeTab === 'plan' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Plano Preventivo</button>
                </nav>
            </div>
            
            {renderContent()}

        </div>
    );
};

export default MaintenanceLog;
