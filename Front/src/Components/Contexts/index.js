/* eslint-disable no-debugger */
import { useContext, useState, createContext, useEffect } from 'react';
import axiosClient from '../Shared/Axios';

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
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('ACCESS_TOKEN'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [notification, setNotification] = useState([]);
  const [carrera, setCarrera] = useState(() => {
    const storedCarrera = localStorage.getItem('carrera');
    return storedCarrera ? JSON.parse(storedCarrera) : null;
  });
  const [unidadesCarrera, setUnidadesCarrera] = useState(() => {
    const stored = localStorage.getItem('unidadesCarrera');
    return stored ? JSON.parse(stored) : [];
  });
  const [unidadesCarreraPorAno, setUnidadesCarreraPorAno] = useState(() => {
    const stored = localStorage.getItem('unidadesCarreraPorAno');
    return stored ? JSON.parse(stored) : {};
  });
  const [unidadesAprobadas, setUnidadesAprobadas] = useState(() => {
    const stored = localStorage.getItem('unidadesAprobadas');
    return stored ? JSON.parse(stored) : [];
  });
  const [unidadesAprobadasPorAno, setUnidadesAprobadasPorAno] = useState(() => {
    const stored = localStorage.getItem('unidadesAprobadasPorAno');
    return stored ? JSON.parse(stored) : {};
  });
  const [unidadesInscriptas, setUnidadesInscriptas] = useState(() => {
    const stored = localStorage.getItem('unidadesInscriptas');
    return stored ? JSON.parse(stored) : [];
  });
  const [unidadesInscriptasPorAno, setUnidadesInscriptasPorAno] = useState(() => {
    const stored = localStorage.getItem('unidadesInscriptasPorAno');
    return stored ? JSON.parse(stored) : {};
  });
  const [unidadesDisponibles, setUnidadesDisponibles] = useState(() => {
    const storedUC = localStorage.getItem('unidadesDisponibles');
    return storedUC ? JSON.parse(storedUC) : [];
  });
  const [unidadesDisponiblesPorAno, setUnidadesDisponiblesPorAno] = useState(() => {
    const stored = localStorage.getItem('unidadesDisponiblesPorAno');
    return stored ? JSON.parse(stored) : {};
  });
  const [isValidating, setIsValidating] = useState(false);

  // Función para limpiar completamente toda la sesión
  const clearAllSession = () => {
    // Limpiar estado en memoria
    setUser(null);
    setToken(null);
    setRole(null);
    setCarrera(null);
    setNotification([]);

    // Limpiar localStorage completamente
    localStorage.clear();

    // Limpiar sessionStorage completamente
    sessionStorage.clear();

    // Limpiar directamente los estados del alumno
    setUnidadesDisponibles([]);
    setUnidadesDisponiblesPorAno({});
    setUnidadesCarrera([]);
    setUnidadesCarreraPorAno({});
    setUnidadesAprobadas([]);
    setUnidadesAprobadasPorAno({});
    setUnidadesInscriptas([]);
    setUnidadesInscriptasPorAno({});

    console.log('Context - Sesión completamente limpiada');
  };

  // Limpia inmediatamente todos los datos académicos del alumno en memoria y sessionStorage
  const resetAlumnoState = () => {
    setCarreraPersist(null);
    setUnidadesDisponiblesPersist([]);
    setUnidadesDisponiblesPorAnoPersist({});
    setUnidadesCarreraPersist([]);
    setUnidadesCarreraPorAnoPersist({});
    setUnidadesAprobadasPersist([]);
    setUnidadesAprobadasPorAnoPersist({});
    setUnidadesInscriptasPersist([]);
    setUnidadesInscriptasPorAnoPersist({});
  };

  // Validar token al cargar la aplicación
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('ACCESS_TOKEN');
      const storedRole = localStorage.getItem('role');
      const storedUser = localStorage.getItem('user');

      console.log('Context - Validando token al cargar...');
      console.log('Context - Stored Token:', storedToken);
      console.log('Context - Stored Role:', storedRole);
      console.log('Context - Stored User:', storedUser);

      // Verificar si estamos en una página de login
      const isOnLoginPage =
        window.location.pathname === '/login' ||
        window.location.pathname === '/admin/login' ||
        window.location.pathname === '/';

      if (isOnLoginPage) {
        console.log('Context - En página de login, limpiando sesión automáticamente');
        clearAllSession();
        setIsValidating(false);
        return;
      }

      if (storedToken && storedRole) {
        // Actualizar el estado con los valores del localStorage
        setToken(storedToken);
        setRole(storedRole);

        // Si ya tenemos el usuario en localStorage, restaurarlo inmediatamente
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            console.log('Context - Usuario restaurado desde localStorage:', userData);
            setIsValidating(false);
            return; // No hacer validación adicional si ya tenemos el usuario
          } catch (error) {
            console.error('Context - Error parseando usuario del localStorage:', error);
            // Si hay error parseando, limpiar el localStorage corrupto
            localStorage.removeItem('user');
          }
        }

        // Solo validar si no tenemos el usuario
        console.log('Context - No hay usuario en localStorage, validando token...');
        setIsValidating(true);
        try {
          if (storedRole === 'admin') {
            console.log('Validando token de admin...');
            const response = await axiosClient.get('/admin/info');
            console.log('Respuesta del servidor:', response.data);
            if (response.data.success && response.data.admin) {
              console.log('Token válido, actualizando estado del admin:', response.data.admin);
              setUser(response.data.admin);
              localStorage.setItem('user', JSON.stringify(response.data.admin));
            }
          }
        } catch (error) {
          console.error('Error validando token:', error.response?.data || error.message);
          // No limpiar sesión automáticamente, solo log del error
        } finally {
          setIsValidating(false);
        }
      } else {
        console.log('Context - No hay token o rol almacenado');
        setIsValidating(false);
      }
    };

    validateToken();
  }, []);

  // Cargar datos académicos vía endpoint único (bootstrap) cuando hay token de alumno
  useEffect(() => {
    const fetchAlumnoData = async () => {
      try {
        if (!token || role !== 'alumno') return;
        const { data } = await axiosClient.get('/alumno/bootstrap');
        if (data?.success) {
          if (data.alumno) {
            setUser(data.alumno);
            localStorage.setItem('user', JSON.stringify(data.alumno));
          }
          if (data.carrera) setCarreraPersist(data.carrera);
          setUnidadesCarreraPersist(data.unidades_carrera || []);
          setUnidadesCarreraPorAnoPersist(data.unidades_carrera_por_ano || {});
          setUnidadesAprobadasPersist(data.unidades_aprobadas || []);
          setUnidadesAprobadasPorAnoPersist(data.unidades_aprobadas_por_ano || {});
          setUnidadesInscriptasPersist(data.unidades_inscriptas || []);
          setUnidadesInscriptasPorAnoPersist(data.unidades_inscriptas_por_ano || {});
          setUnidadesDisponiblesPersist(data.unidades_disponibles || []);
          setUnidadesDisponiblesPorAnoPersist(data.unidades_disponibles_por_ano || {});
        }
      } catch (e) {
        console.error('Error cargando bootstrap del alumno:', e);
      }
    };

    fetchAlumnoData();
  }, [token, role]);

  const setTokenAndRole = (token, role) => {
    setToken(token);
    setRole(role);
    if (token && role) {
      localStorage.setItem('ACCESS_TOKEN', token);
      localStorage.setItem('role', role);
    } else {
      localStorage.removeItem('ACCESS_TOKEN');
      localStorage.removeItem('role');
    }
  };

  const setUserHeader = (userData, token) => {
    setUser(userData);
    if (userData && token) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  };

  const setCarreraPersist = (carreraData) => {
    setCarrera(carreraData);
    if (carreraData) {
      localStorage.setItem('carrera', JSON.stringify(carreraData));
    } else {
      localStorage.removeItem('carrera');
    }
  };

  const setUnidadesDisponiblesPersist = (ucList) => {
    // Asegurar que ucList sea un array
    const safeUcList = Array.isArray(ucList) ? ucList : [];
    setUnidadesDisponibles(safeUcList);
    if (safeUcList) {
      localStorage.setItem('unidadesDisponibles', JSON.stringify(safeUcList));
    } else {
      localStorage.removeItem('unidadesDisponibles');
    }
  };

  const setUnidadesCarreraPersist = (ucList) => {
    // Asegurar que ucList sea un array
    const safeUcList = Array.isArray(ucList) ? ucList : [];
    setUnidadesCarrera(safeUcList);
    if (safeUcList) {
      localStorage.setItem('unidadesCarrera', JSON.stringify(safeUcList));
    } else {
      localStorage.removeItem('unidadesCarrera');
    }
  };

  const setUnidadesCarreraPorAnoPersist = (ucList) => {
    const safeUcList = ucList || {};
    setUnidadesCarreraPorAno(safeUcList);
    if (safeUcList) {
      localStorage.setItem('unidadesCarreraPorAno', JSON.stringify(safeUcList));
    } else {
      localStorage.removeItem('unidadesCarreraPorAno');
    }
  };

  const setUnidadesAprobadasPersist = (ucList) => {
    // Asegurar que ucList sea un array
    const safeUcList = Array.isArray(ucList) ? ucList : [];
    setUnidadesAprobadas(safeUcList);
    if (safeUcList) {
      localStorage.setItem('unidadesAprobadas', JSON.stringify(safeUcList));
    } else {
      localStorage.removeItem('unidadesAprobadas');
    }
  };

  const setUnidadesAprobadasPorAnoPersist = (ucList) => {
    const safeUcList = ucList || {};
    setUnidadesAprobadasPorAno(safeUcList);
    if (safeUcList) {
      localStorage.setItem('unidadesAprobadasPorAno', JSON.stringify(safeUcList));
    } else {
      localStorage.removeItem('unidadesAprobadasPorAno');
    }
  };

  const setUnidadesInscriptasPersist = (ucList) => {
    // Asegurar que ucList sea un array
    const safeUcList = Array.isArray(ucList) ? ucList : [];
    setUnidadesInscriptas(safeUcList);
    if (safeUcList) {
      localStorage.setItem('unidadesInscriptas', JSON.stringify(safeUcList));
    } else {
      localStorage.removeItem('unidadesInscriptas');
    }
  };

  const setUnidadesInscriptasPorAnoPersist = (ucList) => {
    const safeUcList = ucList || {};
    setUnidadesInscriptasPorAno(safeUcList);
    if (safeUcList) {
      localStorage.setItem('unidadesInscriptasPorAno', JSON.stringify(safeUcList));
    } else {
      localStorage.removeItem('unidadesInscriptasPorAno');
    }
  };

  const setUnidadesDisponiblesPorAnoPersist = (ucList) => {
    const safeUcList = ucList || {};
    setUnidadesDisponiblesPorAno(safeUcList);
    if (safeUcList) {
      localStorage.setItem('unidadesDisponiblesPorAno', JSON.stringify(safeUcList));
    } else {
      localStorage.removeItem('unidadesDisponiblesPorAno');
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
        unidadesDisponiblesPorAno,
        setUnidadesDisponiblesPorAno: setUnidadesDisponiblesPorAnoPersist,
        unidadesCarrera,
        setUnidadesCarrera: setUnidadesCarreraPersist,
        unidadesCarreraPorAno,
        setUnidadesCarreraPorAno: setUnidadesCarreraPorAnoPersist,
        unidadesAprobadas,
        setUnidadesAprobadas: setUnidadesAprobadasPersist,
        unidadesAprobadasPorAno,
        setUnidadesAprobadasPorAno: setUnidadesAprobadasPorAnoPersist,
        unidadesInscriptas,
        setUnidadesInscriptas: setUnidadesInscriptasPersist,
        unidadesInscriptasPorAno,
        setUnidadesInscriptasPorAno: setUnidadesInscriptasPorAnoPersist,
        isValidating,
        resetAlumnoState,
        clearAllSession
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

  // Limpiar modal cuando cambia la ruta
  useEffect(() => {
    const handleRouteChange = () => {
      if (modalState.isOpen) {
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
      }
    };

    // Escuchar cambios en la URL
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [modalState.isOpen]);

  const openModal = (modalConfig) => {
    // Limpiar estado anterior antes de abrir nuevo modal
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

    // Pequeño delay para asegurar que el estado anterior se limpie
    setTimeout(() => {
      setModalState({
        isOpen: true,
        ...modalConfig
      });
    }, 50);
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
