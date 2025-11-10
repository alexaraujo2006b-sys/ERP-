
import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { ProductionOrder, MachineStop } from '../types';
import Card from '../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard: React.FC = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const productionOrders = useLiveQuery(() => 
        db.productionOrders.where('startTime').aboveOrEqual(todayTimestamp).toArray(), []
    ) as ProductionOrder[] | undefined;

    const machineStops = useLiveQuery(() => 
        db.machineStops.where('startTime').aboveOrEqual(todayTimestamp).toArray(), []
    ) as MachineStop[] | undefined;

    const [stats, setStats] = useState({
        totalPlanned: 0,
        totalActual: 0,
        totalDowntime: 0,
        availability: 0,
        performance: 0,
        oee: 0,
    });

    useEffect(() => {
        if (productionOrders) {
            const totalPlanned = productionOrders.reduce((sum, op) => sum + op.plannedKg, 0);
            const totalActual = productionOrders.reduce((sum, op) => sum + op.actualKg, 0);
            const totalDowntime = (machineStops || []).reduce((sum, stop) => sum + (stop.endTime - stop.startTime), 0) / (1000 * 60); // in minutes
            
            const totalScheduledTime = 24 * 60; // Minutes in a day
            const operatingTime = totalScheduledTime - totalDowntime;
            const availability = totalScheduledTime > 0 ? (operatingTime / totalScheduledTime) : 0;
            const performance = totalPlanned > 0 ? (totalActual / totalPlanned) : 0;
            const quality = 1; // as per requirement
            const oee = availability * performance * quality;

            setStats({
                totalPlanned,
                totalActual,
                totalDowntime: Math.round(totalDowntime),
                availability,
                performance,
                oee,
            });
        }
    }, [productionOrders, machineStops]);

    const stopCategoryData = machineStops?.reduce((acc, stop) => {
        const duration = (stop.endTime - stop.startTime) / (1000 * 60);
        const existing = acc.find(item => item.name === stop.category);
        if (existing) {
            existing.value += duration;
        } else {
            acc.push({ name: stop.category, value: duration });
        }
        return acc;
    }, [] as { name: string; value: number; }[]) || [];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard - Produção Diária</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-blue-50">
                    <h3 className="text-lg font-semibold text-blue-800">OEE (Simplificado)</h3>
                    <p className="text-4xl font-bold text-blue-900">{(stats.oee * 100).toFixed(2)}%</p>
                </Card>
                <Card className="bg-green-50">
                    <h3 className="text-lg font-semibold text-green-800">Produção Real</h3>
                    <p className="text-4xl font-bold text-green-900">{stats.totalActual.toFixed(2)} kg</p>
                </Card>
                 <Card className="bg-yellow-50">
                    <h3 className="text-lg font-semibold text-yellow-800">Produção Planejada</h3>
                    <p className="text-4xl font-bold text-yellow-900">{stats.totalPlanned.toFixed(2)} kg</p>
                </Card>
                <Card className="bg-red-50">
                    <h3 className="text-lg font-semibold text-red-800">Tempo de Parada</h3>
                    <p className="text-4xl font-bold text-red-900">{stats.totalDowntime} min</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Produção por OP (Hoje)">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={productionOrders}>
                            <XAxis dataKey="op" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="plannedKg" fill="#8884d8" name="Planejado (kg)" />
                            <Bar dataKey="actualKg" fill="#82ca9d" name="Real (kg)" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Causas de Parada (Hoje)">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={stopCategoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                {stopCategoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `${value.toFixed(0)} min`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
