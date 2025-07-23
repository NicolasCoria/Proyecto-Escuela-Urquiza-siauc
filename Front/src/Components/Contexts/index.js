/* eslint-disable no-debugger */
import { useContext, useState, createContext } from 'react';

const StateContext = createContext({
  user: null,
  role: null,
  carrera: null,
  unidadesDisponibles: [],
  setUser: () => {},
  setTokenAndRole: () => {},
  setUserHeader: () => {},
  setCarrera: () => {},
  setUnidadesDisponibles: () => {},
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
  const [carrera, setCarrera] = useState(() => {
    const storedCarrera = sessionStorage.getItem('carrera');
    return storedCarrera ? JSON.parse(storedCarrera) : null;
  });
  const [unidadesDisponibles, setUnidadesDisponibles] = useState(() => {
    const storedUC = sessionStorage.getItem('unidadesDisponibles');
    return storedUC ? JSON.parse(storedUC) : [];
  });
  const [unidadesCarrera, setUnidadesCarrera] = useState(() => {
    const stored = sessionStorage.getItem('unidadesCarrera');
    return stored ? JSON.parse(stored) : [];
  });
  const [unidadesAprobadas, setUnidadesAprobadas] = useState(() => {
    const stored = sessionStorage.getItem('unidadesAprobadas');
    return stored ? JSON.parse(stored) : [];
  });
  const [unidadesInscriptas, setUnidadesInscriptas] = useState(() => {
    const stored = sessionStorage.getItem('unidadesInscriptas');
    return stored ? JSON.parse(stored) : [];
  });

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

  const setCarreraPersist = (carreraData) => {
    setCarrera(carreraData);
    if (carreraData) {
      sessionStorage.setItem('carrera', JSON.stringify(carreraData));
    } else {
      sessionStorage.removeItem('carrera');
    }
  };

  const setUnidadesDisponiblesPersist = (ucList) => {
    setUnidadesDisponibles(ucList);
    if (ucList) {
      sessionStorage.setItem('unidadesDisponibles', JSON.stringify(ucList));
    } else {
      sessionStorage.removeItem('unidadesDisponibles');
    }
  };

  const setUnidadesCarreraPersist = (ucList) => {
    setUnidadesCarrera(ucList);
    if (ucList) {
      sessionStorage.setItem('unidadesCarrera', JSON.stringify(ucList));
    } else {
      sessionStorage.removeItem('unidadesCarrera');
    }
  };
  const setUnidadesAprobadasPersist = (ucList) => {
    setUnidadesAprobadas(ucList);
    if (ucList) {
      sessionStorage.setItem('unidadesAprobadas', JSON.stringify(ucList));
    } else {
      sessionStorage.removeItem('unidadesAprobadas');
    }
  };
  const setUnidadesInscriptasPersist = (ucList) => {
    setUnidadesInscriptas(ucList);
    if (ucList) {
      sessionStorage.setItem('unidadesInscriptas', JSON.stringify(ucList));
    } else {
      sessionStorage.removeItem('unidadesInscriptas');
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
        updateNotification,
        carrera,
        setCarrera: setCarreraPersist,
        unidadesDisponibles,
        setUnidadesDisponibles: setUnidadesDisponiblesPersist,
        unidadesCarrera,
        setUnidadesCarrera: setUnidadesCarreraPersist,
        unidadesAprobadas,
        setUnidadesAprobadas: setUnidadesAprobadasPersist,
        unidadesInscriptas,
        setUnidadesInscriptas: setUnidadesInscriptasPersist
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
