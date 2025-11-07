import React, { createContext, useContext, useReducer, useEffect,useState } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/api';
import { useCallback } from 'react';

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
          item.id === action.payload.id
            ? {
                ...item,
                ...action.payload,
                produto: action.payload.produto || item.produto,
              }
            : item
        ),
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload),
      };

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
  const [cartUpdateSignal, setCartUpdateSignal] = useState(0);

  const triggerCartUpdate = useCallback(() => {
    setCartUpdateSignal(prev => prev + 1);
  }, []);

  // 🔹 Carrega carrinho do backend
  const fetchCart = useCallback(async () => {
    const userIdToFetch = user?.id || user?.clienteId;
    if (!userIdToFetch) {
      dispatch({ type: 'SET_CART', payload: { cartId: null, items: [], total: 0 } });
      return;
    }

    try {
      const res = await api.get(`/carrinho/${userIdToFetch}`);
      const data = res.data;

      dispatch({
        type: 'SET_CART',
        payload: {
          cartId: data.id,
          items: data.itens || [],
          total: data.total || 0,
        },
      });
      return data;
    } catch (err) {
      console.error('Erro ao carregar carrinho:', err);
      dispatch({ type: 'SET_CART', payload: { cartId: null, items: [], total: 0 } });
    }
  }, [user, dispatch]);

  const addToCartWithStock = async (produto, quantidade) => {
    if (!user?.id) return { success: false, message: 'Usuário não identificado' };

    const existingItem = cartState.items.find(i => i?.produto?.id === produto.id);
    const currentQty = existingItem ? existingItem.quantidade : 0;
    const newQty = currentQty + quantidade;

    if (newQty > produto.estoque) {
      return {
        success: false,
        message: `Não é possível adicionar mais de ${produto.estoque} unidades deste produto.`,
      };
    }

    if (existingItem) {
      dispatch({
        type: 'UPDATE_ITEM',
        payload: { ...existingItem, quantidade: newQty },
      });
    } else {
      const tempItem = { id: `temp-${produto.id}`, quantidade, produto };
      dispatch({ type: 'ADD_ITEM', payload: tempItem });
    }

    try {
      const res = await api.post(`/carrinho/${user.id}/item`, {
        produtoId: produto.id,
        quantidade,
      });
      triggerCartUpdate();

      if (existingItem) {
        dispatch({
          type: 'UPDATE_ITEM',
          payload: { ...res.data, produto },
        });
      } else {
        dispatch({ type: 'REMOVE_ITEM', payload: `temp-${produto.id}` });
        dispatch({
          type: 'ADD_ITEM',
          payload: { ...res.data, produto },
        });
      }

      return { success: true, message: `${produto.nome} adicionado ao carrinho!` };
    } catch (err) {
      console.error('Erro ao adicionar ao carrinho:', err);

      // reverte estado local se falhar
      if (existingItem) {
        dispatch({ type: 'UPDATE_ITEM', payload: existingItem });
      } else {
        dispatch({ type: 'REMOVE_ITEM', payload: `temp-${produto.id}` });
      }

      return { success: false, message: 'Erro ao adicionar ao carrinho.' };
    }
  };

  const updateItem = async (itemId, quantidade) => {
    if (!user?.id) return;
    try {
      const res = await api.patch(`/carrinho/${user.id}/item/${itemId}`, {
        quantidade: Number(quantidade),
      });
      dispatch({ type: 'UPDATE_ITEM', payload: res.data });
      triggerCartUpdate();
    } catch (err) {
      console.error('Erro ao atualizar item:', err);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!user?.id) return;
    try {
      await api.delete(`/carrinho/${user.id}/item/${itemId}`);
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
      triggerCartUpdate();
    } catch (err) {
      console.error('Erro ao remover item:', err);
    }
  };

  const limparCarrinho = async () => {
  if (!user?.id) return;

  try {
    await api.delete(`/carrinho/${user.id}/limpar`);
    localStorage.removeItem("carrinho");
    dispatch({ type: 'CLEAR_CART' });
    triggerCartUpdate();
  } catch (err) {
    console.error('Erro ao limpar carrinho:', err);
  }
};
  useEffect(() => {
    if (user?.id) fetchCart();
  }, [user?.id,fetchCart]);

  return (
    <CartContext.Provider
      value={{
        cartState,
        fetchCart,
        addToCartWithStock,
        updateItem,
        removeFromCart,
        dispatch,
        cartUpdateSignal,
        limparCarrinho,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
