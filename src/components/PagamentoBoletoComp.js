import React from 'react';

const PagamentoBoletoForm = () => {
  return (
    <div className="mt-3 p-3 border rounded bg-light">
      <h5 className='text-primary'>Pagamento via Boleto Bancário</h5>
      <p className="text-primary">
        O boleto será gerado e estará disponível para visualização e pagamento na
        página de detalhes do pedido após a finalização da compra.
      </p>
    </div>
  );
};

export default PagamentoBoletoForm;