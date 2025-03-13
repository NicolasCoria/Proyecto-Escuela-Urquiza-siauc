/* eslint-disable no-debugger */
import { useContext, useState, createContext } from 'react';

const StateContext = createContext({
  user: null,
  role: null,
  setUser: () => {},
  setTokenAndRole: () => {},
  setUserHeader: () => {},
  updateNotification: () => {}
});

export const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(sessionStorage.getItem('ACCESS_TOKEN'));
  const [role, setRole] = useState(sessionStorage.getItem('role'));
  const [notification, setNotification] = useState([]);

  const setTokenAndRole = (token, role) => {
    setToken(token);
    setRole(role);
    if (token && role) {
      sessionStorage.setItem('ACCESS_TOKEN', token);
      sessionStorage.setItem('role', role);
    } else {
      sessionStorage.removeItem('ACCESS_TOKEN');
      sessionStorage.removeItem('role');
    }
  };

  const setUserHeader = (userData, token) => {
    setUser(userData);
    if (userData && token) {
      sessionStorage.setItem('user', JSON.stringify(userData));
    } else {
      sessionStorage.removeItem('user');
    }
  };

  const updateNotification = (newNotifications) => {
    setNotification(newNotifications);
  };

  return (
    <StateContext.Provider
      value={{
        user,
        token,
        role,
        notification,
        setUserHeader,
        setUser,
        setTokenAndRole,
        updateNotification
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    description: '',
    title: '',
    confirmBtn: '',
    denyBtn: '',
    noButton: false,
    chooseModal: false,
    onClick: null
  });

  const openModal = (modalConfig) => {
    setModalState({
      isOpen: true,
      ...modalConfig
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      description: '',
      title: '',
      confirmBtn: '',
      denyBtn: '',
      noButton: false,
      chooseModal: false,
      onClick: null
    });
  };

  return (
    <ModalContext.Provider value={{ modalState, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModalContext = () => {
  return useContext(ModalContext);
};
