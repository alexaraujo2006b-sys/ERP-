
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { ProductionOrder } from '../types';
import Button from '../components/ui/Button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PCP: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const productionOrders = useLiveQuery(() => db.productionOrders.toArray(), []) as ProductionOrder[] | undefined;

  const handleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && productionOrders) {
      setSelectedIds(productionOrders.map(op => op.id!));
    } else {
      setSelectedIds([]);
    }
  };

  const getSelectedOrders = () => {
      return productionOrders?.filter(op => selectedIds.includes(op.id!)) || [];
  }

  const formatCSVField = (data: any) => {
    const stringData = String(data === null || data === undefined ? '' : data);
    if (stringData.includes(',') || stringData.includes('\n') || stringData.includes('"')) {
        return `"${stringData.replace(/"/g, '""')}"`;
    }
    return stringData;
  };

  const exportCSV = () => {
    const ordersToExport = getSelectedOrders();
    if (ordersToExport.length === 0) return;

    const headers = ['ID', 'OP', 'Produto', 'Lote', 'Status', 'Planejado (kg)', 'Real (kg)', 'Operador', 'Início', 'Fim'];
    const rows = ordersToExport.map(op => [
      op.id,
      op.op,
      op.product,
      op.lot,
      op.status,
      op.plannedKg,
      op.actualKg,
      op.operator,
      op.startTime ? new Date(op.startTime).toLocaleString() : 'N/A',
      op.endTime ? new Date(op.endTime).toLocaleString() : 'N/A'
    ].map(formatCSVField).join(','));
    
    const csvContent = "data:text/csv;charset=utf-8," + '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_pcp.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportPDF = () => {
    const ordersToExport = getSelectedOrders();
    if (ordersToExport.length === 0) {
        alert("Por favor, selecione ao menos uma OP para exportar.");
        return;
    };
    
    const doc = new jsPDF();
    doc.text("Relatório de Produção - PCP", 14, 15);
    (doc as any).autoTable({
        head: [['OP', 'Produto', 'Lote', 'Status', 'Planejado (kg)', 'Real (kg)', 'Operador']],
        body: ordersToExport.map(op => [
            op.op, op.product, op.lot, op.status, op.plannedKg, op.actualKg, op.operator
        ]),
        startY: 20,
    });
    doc.save('relatorio_pcp.pdf');
  };
  

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">PCP - Relatórios</h1>
        <div className="space-x-2">
            <Button onClick={exportCSV} variant="secondary" disabled={selectedIds.length === 0}>Exportar Excel (CSV)</Button>
            <Button onClick={exportPDF} variant="secondary" disabled={selectedIds.length === 0}>Exportar PDF</Button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="p-3"><input type="checkbox" onChange={handleSelectAll} checked={productionOrders?.length === selectedIds.length && selectedIds.length > 0} /></th>
              <th className="p-3">OP</th>
              <th className="p-3">Produto</th>
              <th className="p-3">Status</th>
              <th className="p-3">Data Início</th>
              <th className="p-3">Kg Previsto</th>
              <th className="p-3">Kg Real</th>
              <th className="p-3">Desvio (%)</th>
            </tr>
          </thead>
          <tbody>
            {productionOrders?.map(op => {
              const deviation = op.plannedKg > 0 ? ((op.actualKg - op.plannedKg) / op.plannedKg) * 100 : 0;
              return (
                <tr key={op.id} className="border-b hover:bg-gray-50">
                  <td className="p-3"><input type="checkbox" checked={selectedIds.includes(op.id!)} onChange={() => handleSelect(op.id!)} /></td>
                  <td className="p-3 font-medium">{op.op}</td>
                  <td className="p-3">{op.product}</td>
                  <td className="p-3">{op.status}</td>
                  <td className="p-3">{op.startTime ? new Date(op.startTime).toLocaleDateString() : '-'}</td>
                  <td className="p-3">{op.plannedKg.toFixed(2)}</td>
                  <td className="p-3">{op.actualKg.toFixed(2)}</td>
                  <td className={`p-3 font-semibold ${deviation < 0 ? 'text-red-600' : 'text-green-600'}`}>{deviation.toFixed(2)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PCP;
