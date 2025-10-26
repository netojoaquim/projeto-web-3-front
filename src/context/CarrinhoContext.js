import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const BASE_URL = 'http://localhost:5000';

const initialState = {
  cartId: null,
  items: [],
  total: 0,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, ...action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };
    case 'CLEAR_CART':
      return initialState;
    default:
      return state;
  }
};

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartState, dispatch] = useReducer(cartReducer, initialState);

  // GET: busca carrinho do cliente
  const fetchCart = async () => {
    if (!user?.id) {
      console.log('fetchCart abortado: usuário não definido');
      return;
    }

    try {
      console.log('Buscando carrinho do cliente:', user.id);
      const res = await axios.get(`${BASE_URL}/carrinho/${user.id}`);
      console.log('Carrinho retornado:', res.data);
      dispatch({
        type: 'SET_CART',
        payload: {
          cartId: res.data.id,
          items: res.data.items || [],
          total: res.data.total || 0,
        },
      });
    } catch (err) {
      console.error('Erro ao carregar carrinho:', err);
    }
  };

  // POST: adiciona item ao carrinho
  const addToCart = async (productId, quantidade) => {
    if (!user?.id) return;
    try {
      const res = await axios.post(`${BASE_URL}/carrinho/${user.id}/item`, {
        produtoId: productId,
        quantidade,
      });
      console.log('Item adicionado:', res.data);
      dispatch({ type: 'ADD_ITEM', payload: res.data });
    } catch (err) {
      console.error('Erro ao adicionar item:', err);
    }
  };

  // PATCH: atualiza item do carrinho
  const updateItem = async (itemId, quantidade) => {
    if (!user?.id) return;
    try {
      const res = await axios.patch(`${BASE_URL}/carrinho/${user.id}/item/${itemId}`, {
        quantidade,
      });
      console.log('Item atualizado:', res.data);
      dispatch({ type: 'UPDATE_ITEM', payload: res.data });
    } catch (err) {
      console.error('Erro ao atualizar item:', err);
    }
  };

  // DELETE: remove item do carrinho
  const removeFromCart = async (itemId) => {
    if (!user?.id) return;
    try {
      await axios.delete(`${BASE_URL}/carrinho/${user.id}/item/${itemId}`);
      console.log('Item removido:', itemId);
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
    } catch (err) {
      console.error('Erro ao remover item:', err);
    }
  };

  // Chama fetchCart automaticamente quando o usuário estiver definido
  useEffect(() => {
    if (user?.id) {
      fetchCart();
    }
  }, [user?.id]);

  return (
    <CartContext.Provider
      value={{
        cartState,
        fetchCart,
        addToCart,
        updateItem,
        removeFromCart,
        dispatch, // opcional: se precisar direto do dispatch
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
