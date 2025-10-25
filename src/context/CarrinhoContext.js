import React, { createContext, useContext, useReducer } from 'react';

// 1. Estado Inicial e Funções Redutoras
const initialState = {
  items: [],
  // Adicione aqui outras propriedades do carrinho (ex: total, frete)
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      // Lógica para adicionar ou atualizar quantidade de um item existente
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);

      if (existingItemIndex > -1) {
        // Item já existe: retorna novo estado com a quantidade atualizada
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += 1;
        return { ...state, items: updatedItems };
      } else {
        // Item novo: adiciona ao array
        return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
      }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id),
      };

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
};

// 2. Criação do Contexto
const CartContext = createContext();

// 3. Provedor (Componente para envolver a aplicação)
export const CartProvider = ({ children }) => {
  const [cartState, dispatch] = useReducer(cartReducer, initialState);

  // Funções que serão passadas para o contexto
  const addToCart = (product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id: productId } });
  };

  // Adicione outras funções (updateQuantity, clearCart)

  return (
    <CartContext.Provider value={{ cartState, addToCart, removeFromCart, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

// 4. Hook customizado para consumir o contexto
export const useCart = () => useContext(CartContext);