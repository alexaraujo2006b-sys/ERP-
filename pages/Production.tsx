
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { ProductionOrder, MachineStop, MaterialConsumption, WasteLog } from '../types';
import { UserRole, StopCategory } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Modal: React.FC<{ title: string; children: React.ReactNode; onClose: () => void; }> = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl font-light">&times;</button>
            </div>
            {children}
        </div>
    </div>
);

const NewStopModal: React.FC<{ order: ProductionOrder, onClose: () => void }> = ({ order, onClose }) => {
    const [category, setCategory] = useState<StopCategory>(StopCategory.MECANICA);
    const [subCause, setSubCause] = useState('');
    const [responsible, setResponsible] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newStop: MachineStop = {
            productionOrderId: order.id!,
            startTime: Date.now(),
            endTime: Date.now(), // Simplified: operator logs stop when it ends. A better implementation might have start/end times.
            category,
            subCause,
            responsible,
            description,
        };
        await db.machineStops.add(newStop);
        alert('Parada registrada com sucesso!');
        onClose();
    };

    return (
        <Modal title="Registrar Nova Parada" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <select value={category} onChange={e => setCategory(e.target.value as StopCategory)} className="w-full p-2 border rounded">
                    {Object.values(StopCategory).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="text" placeholder="Subcausa" value={subCause} onChange={e => setSubCause(e.target.value)} required className="w-full p-2 border rounded" />
                <input type="text" placeholder="Responsável" value={responsible} onChange={e => setResponsible(e.target.value)} required className="w-full p-2 border rounded" />
                <textarea placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-2 border rounded" />
                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Registrar</Button>
                </div>
            </form>
        </Modal>
    );
};

const LogProductionModal: React.FC<{ order: ProductionOrder, onClose: () => void }> = ({ order, onClose }) => {
    const [amount, setAmount] = useState(0);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await db.productionOrders.update(order.id!, { actualKg: order.actualKg + amount });
        alert('Produção apontada com sucesso!');
        onClose();
    };
    return (
        <Modal title="Apontar Produção" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <p>Produção atual: {order.actualKg.toFixed(2)} kg</p>
                <input type="number" step="0.01" placeholder="Kg Produzido" value={amount} onChange={e => setAmount(Number(e.target.value))} required className="w-full p-2 border rounded" />
                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Adicionar</Button>
                </div>
            </form>
        </Modal>
    );
};

const LogConsumptionModal: React.FC<{ order: ProductionOrder, onClose: () => void }> = ({ order, onClose }) => {
    const materials = ['PP', 'CaCO₃', 'Estearato', 'Óleo/mineral', 'Aditivos'];
    const [material, setMaterial] = useState(materials[0]);
    const [lot, setLot] = useState('');
    const [qty, setQty] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const consumption: Omit<MaterialConsumption, 'plannedQty'> = {
            productionOrderId: order.id!,
            material,
            lot,
            actualQty: qty,
        };
        await db.materialConsumptions.add(consumption as MaterialConsumption);
        alert('Consumo registrado!');
        onClose();
    };

    return (
        <Modal title="Registrar Consumo de Insumo" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <select value={material} onChange={e => setMaterial(e.target.value)} className="w-full p-2 border rounded">
                    {materials.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input type="text" placeholder="Lote do Insumo" value={lot} onChange={e => setLot(e.target.value)} required className="w-full p-2 border rounded" />
                <input type="number" step="0.01" placeholder="Quantidade (kg)" value={qty} onChange={e => setQty(Number(e.target.value))} required className="w-full p-2 border rounded" />
                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Registrar</Button>
                </div>
            </form>
        </Modal>
    );
};

const LogWasteModal: React.FC<{ order: ProductionOrder, onClose: () => void }> = ({ order, onClose }) => {
    const [wasteKg, setWasteKg] = useState(0);
    const [reason, setReason] = useState('');
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const waste: WasteLog = {
            productionOrderId: order.id!,
            wasteKg,
            reason,
            logTime: Date.now(),
        };
        await db.wasteLogs.add(waste);
        alert('Resíduo apontado com sucesso!');
        onClose();
    };
    return (
        <Modal title="Apontar Resíduo" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="number" step="0.01" placeholder="Resíduo (kg)" value={wasteKg} onChange={e => setWasteKg(Number(e.target.value))} required className="w-full p-2 border rounded" />
                <textarea placeholder="Motivo" value={reason} onChange={e => setReason(e.target.value)} required className="w-full p-2 border rounded" />
                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="submit">Apontar</Button>
                </div>
            </form>
        </Modal>
    );
};


// Define components inside the file but outside the main component
const ProductionOrderForm: React.FC<{ order?: ProductionOrder; onSave: () => void; onCancel: () => void }> = ({ order, onSave, onCancel }) => {
    const [op, setOp] = useState(order?.op || '');
    const [product, setProduct] = useState(order?.product || '');
    const [lot, setLot] = useState(order?.lot || '');
    const [plannedKg, setPlannedKg] = useState(order?.plannedKg || 0);
    const [operator, setOperator] = useState(order?.operator || '');
    const [notes, setNotes] = useState(order?.notes || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newOrder: ProductionOrder = {
            ...order,
            op,
            product,
            lot,
            plannedKg: +plannedKg,
            actualKg: order?.actualKg || 0,
            operator,
            notes,
            status: order?.status || 'Pendente',
        };

        if (order?.id) {
            await db.productionOrders.update(order.id, newOrder);
        } else {
            await db.productionOrders.add(newOrder);
        }
        onSave();
    };

    return (
         <Card title={order ? 'Editar Ordem de Produção' : 'Nova Ordem de Produção'} className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="OP" value={op} onChange={e => setOp(e.target.value)} required className="p-2 border rounded" />
                    <input type="text" placeholder="Produto" value={product} onChange={e => setProduct(e.target.value)} required className="p-2 border rounded" />
                    <input type="text" placeholder="Lote" value={lot} onChange={e => setLot(e.target.value)} required className="p-2 border rounded" />
                    <input type="number" placeholder="Produção Prevista (kg)" value={plannedKg} onChange={e => setPlannedKg(Number(e.target.value))} required className="p-2 border rounded" />
                    <input type="text" placeholder="Operador" value={operator} onChange={e => setOperator(e.target.value)} required className="p-2 border rounded" />
                 </div>
                 <textarea placeholder="Observações" value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 border rounded" />
                <div className="flex justify-end space-x-4">
                    <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                </div>
            </form>
         </Card>
    );
};


const Production: React.FC = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ProductionOrder | undefined>(undefined);
  
  const productionOrders = useLiveQuery(() => db.productionOrders.orderBy('id').reverse().toArray(), []);
  const activeOrder = productionOrders?.find(op => op.status === 'Ativa');

  const handleActivate = async (order: ProductionOrder) => {
    if (activeOrder && activeOrder.id !== order.id) {
        await db.productionOrders.update(activeOrder.id!, { status: 'Concluída', endTime: Date.now() });
    }
    await db.productionOrders.update(order.id!, { status: 'Ativa', startTime: Date.now() });
  };
  
  const handleEdit = (order: ProductionOrder) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingOrder(undefined);
  };
  
  const renderOrderRow = (order: ProductionOrder) => (
    <tr key={order.id} className="border-b hover:bg-gray-50" onDoubleClick={() => user?.role === UserRole.OPERACIONAL && handleActivate(order)}>
      <td className="p-3">{order.op}</td>
      <td className="p-3">{order.product}</td>
      <td className="p-3">{order.status === 'Ativa' ? <span className="px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded-full">Ativa</span> : order.status}</td>
      <td className="p-3">{order.plannedKg} kg</td>
      <td className="p-3">{order.actualKg} kg</td>
      <td className="p-3">{order.operator}</td>
      {user?.role === UserRole.CONTROLE && (
        <td className="p-3 space-x-2">
          <Button size="sm" onClick={() => handleActivate(order)} disabled={order.status === 'Ativa'}>Ativar</Button>
          <Button size="sm" variant="secondary" onClick={() => handleEdit(order)}>Editar</Button>
        </td>
      )}
    </tr>
  );

  if (showForm) {
      return <ProductionOrderForm order={editingOrder} onSave={handleCloseForm} onCancel={handleCloseForm} />;
  }
  
  if (user?.role === UserRole.OPERACIONAL && activeOrder) {
      return <ActiveProductionView order={activeOrder} />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Ordens de Produção</h1>
        {user?.role === UserRole.CONTROLE && (
          <Button onClick={() => { setEditingOrder(undefined); setShowForm(true); }}>Nova OP</Button>
        )}
      </div>
      
      {user?.role === UserRole.OPERACIONAL && !activeOrder && <p className="text-center text-lg text-gray-600">Nenhuma ordem de produção ativa no momento. Dê um duplo clique em uma OP da lista para ativá-la.</p>}
      
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="p-3">OP</th>
              <th className="p-3">Produto</th>
              <th className="p-3">Status</th>
              <th className="p-3">Previsto</th>
              <th className="p-3">Real</th>
              <th className="p-3">Operador</th>
              {user?.role === UserRole.CONTROLE && <th className="p-3">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {productionOrders?.map(renderOrderRow)}
          </tbody>
        </table>
      </div>
    </div>
  );
};


const ActiveProductionView: React.FC<{order: ProductionOrder}> = ({order}) => {
    const [modal, setModal] = useState<string | null>(null);

    return (
        <div className="p-8">
            {modal === 'stop' && <NewStopModal order={order} onClose={() => setModal(null)} />}
            {modal === 'production' && <LogProductionModal order={order} onClose={() => setModal(null)} />}
            {modal === 'consumption' && <LogConsumptionModal order={order} onClose={() => setModal(null)} />}
            {modal === 'waste' && <LogWasteModal order={order} onClose={() => setModal(null)} />}

            <Card title={`OP Ativa: ${order.op} - ${order.product}`}>
                <div className="text-lg space-y-2 mb-6">
                    <p><strong>Lote:</strong> {order.lot}</p>
                    <p><strong>Planejado:</strong> {order.plannedKg} kg</p>
                    <p><strong>Produzido:</strong> {order.actualKg} kg</p>
                </div>
                 <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button size="lg" variant="danger" onClick={() => setModal('stop')}>Nova Parada</Button>
                    <Button size="lg" variant="primary" onClick={() => setModal('production')}>Apontar Produção</Button>
                    <Button size="lg" variant="secondary" onClick={() => setModal('consumption')}>Consumo Insumo</Button>
                    <Button size="lg" variant="warning" onClick={() => setModal('waste')}>Apontar Resíduo</Button>
                 </div>
            </Card>
        </div>
    )
}

export default Production;
