import React, { useState } from 'react';

type CardProps = {
  label: string;
  onClick: () => void;
};

const Card: React.FC<CardProps> = ({ label, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        border: '1px solid black',
        padding: '20px',
        margin: '10px',
        cursor: 'pointer'
      }}
    >
      {label}
    </div>
  );
};

const NewComponent: React.FC = () => {
  return <div>Este es el nuevo componente</div>;
};

const App: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);

  // Si se ha seleccionado alguna, renderiza el nuevo componente.
  if (selected) {
    return <NewComponent />;
  }

  // Si no, muestra tres instancias de Card.
  return (
    <div>
      <Card label="Componente 1" onClick={() => setSelected('1')} />
      <Card label="Componente 2" onClick={() => setSelected('2')} />
      <Card label="Componente 3" onClick={() => setSelected('3')} />
    </div>
  );
};

export default App;
