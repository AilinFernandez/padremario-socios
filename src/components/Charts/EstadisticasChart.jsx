import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Card } from 'react-bootstrap';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const EstadisticasChart = ({ 
  tipo = 'bar', 
  datos, 
  titulo, 
  altura = 300,
  mostrarLeyenda = true 
}) => {
  const opciones = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: mostrarLeyenda,
        position: 'top',
      },
      title: {
        display: !!titulo,
        text: titulo,
      },
    },
  };

  if (tipo === 'doughnut') {
    return (
      <Card className="opm-card">
        <Card.Body>
          <div style={{ height: altura }}>
            <Doughnut data={datos} options={opciones} />
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="opm-card">
      <Card.Body>
        <div style={{ height: altura }}>
          <Bar data={datos} options={opciones} />
        </div>
      </Card.Body>
    </Card>
  );
};

export default EstadisticasChart; 