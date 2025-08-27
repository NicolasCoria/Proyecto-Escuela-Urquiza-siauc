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
  const [unidadesCarrera, setUnidadesCarrera] = useState(() => {
    const stored = sessionStorage.getItem('unidadesCarrera');
    return stored ? JSON.parse(stored) : [];
  });
  const [unidadesCarreraPorAno, setUnidadesCarreraPorAno] = useState(() => {
    const stored = sessionStorage.getItem('unidadesCarreraPorAno');
    return stored ? JSON.parse(stored) : {};
  });
  const [unidadesAprobadas, setUnidadesAprobadas] = useState(() => {
    const stored = sessionStorage.getItem('unidadesAprobadas');
    return stored ? JSON.parse(stored) : [];
  });
  const [unidadesAprobadasPorAno, setUnidadesAprobadasPorAno] = useState(() => {
    const stored = sessionStorage.getItem('unidadesAprobadasPorAno');
    return stored ? JSON.parse(stored) : {};
  });
  const [unidadesInscriptas, setUnidadesInscriptas] = useState(() => {
    const stored = sessionStorage.getItem('unidadesInscriptas');
    return stored ? JSON.parse(stored) : [];
  });
  const [unidadesInscriptasPorAno, setUnidadesInscriptasPorAno] = useState(() => {
    const stored = sessionStorage.getItem('unidadesInscriptasPorAno');
    return stored ? JSON.parse(stored) : {};
  });
  const [unidadesDisponibles, setUnidadesDisponibles] = useState(() => {
    const storedUC = sessionStorage.getItem('unidadesDisponibles');
    return storedUC ? JSON.parse(storedUC) : [];
  });
  const [unidadesDisponiblesPorAno, setUnidadesDisponiblesPorAno] = useState(() => {
    const stored = sessionStorage.getItem('unidadesDisponiblesPorAno');
    return stored ? JSON.parse(stored) : {};
  });
  const [isValidating, setIsValidating] = useState(false);

  // Validar token al cargar la aplicación
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = sessionStorage.getItem('ACCESS_TOKEN');
      const storedRole = sessionStorage.getItem('role');

      if (storedToken && storedRole) {
        setIsValidating(true);
        try {
          // Intentar hacer una petición para validar el token
          if (storedRole === 'alumno') {
            console.log('Validando token de alumno...');
            const response = await axiosClient.get('/alumno/info');
            // Actualizar el estado del usuario con la información del backend
            if (response.data.success && response.data.alumno) {
              console.log('Token válido, actualizando estado del alumno:', response.data.alumno);
              setUser(response.data.alumno);
              sessionStorage.setItem('user', JSON.stringify(response.data.alumno));

              // Si el alumno tiene carrera, actualizar el estado de la carrera
              if (response.data.alumno.carrera) {
                // Buscar la carrera completa en sessionStorage o usar la información básica
                const storedCarrera = sessionStorage.getItem('carrera');
                if (storedCarrera) {
                  const carreraData = JSON.parse(storedCarrera);
                  console.log('Actualizando estado de carrera:', carreraData);
                  setCarrera(carreraData);
                }
              }
            }
          } else if (storedRole === 'admin') {
            console.log('Validando token de admin...');
            const response = await axiosClient.get('/admin/info');
            // Actualizar el estado del usuario con la información del backend
            if (response.data.success && response.data.admin) {
              console.log('Token válido, actualizando estado del admin:', response.data.admin);
              setUser(response.data.admin);
              sessionStorage.setItem('user', JSON.stringify(response.data.admin));
            }
          }
          // Si llega aquí, el token es válido
          console.log('Token válido, usuario autenticado');
        } catch (error) {
          console.log('Token inválido, limpiando sesión');
          // Token inválido, limpiar sesión
          sessionStorage.removeItem('ACCESS_TOKEN');
          sessionStorage.removeItem('role');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('carrera');
          sessionStorage.removeItem('unidadesDisponibles');
          sessionStorage.removeItem('unidadesCarrera');
          sessionStorage.removeItem('unidadesAprobadas');
          sessionStorage.removeItem('unidadesInscriptas');

          setToken(null);
          setRole(null);
          setUser(null);
          setCarrera(null);
          setUnidadesDisponibles([]);
          setUnidadesCarrera([]);
          setUnidadesAprobadas([]);
          setUnidadesInscriptas([]);
        } finally {
          setIsValidating(false);
        }
      } else {
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
            sessionStorage.setItem('user', JSON.stringify(data.alumno));
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
    // Asegurar que ucList sea un array
    const safeUcList = Array.isArray(ucList) ? ucList : [];
    setUnidadesDisponibles(safeUcList);
    if (safeUcList) {
      sessionStorage.setItem('unidadesDisponibles', JSON.stringify(safeUcList));
    } else {
      sessionStorage.removeItem('unidadesDisponibles');
    }
  };

  const setUnidadesCarreraPersist = (ucList) => {
    // Asegurar que ucList sea un array
    const safeUcList = Array.isArray(ucList) ? ucList : [];
    setUnidadesCarrera(safeUcList);
    if (safeUcList) {
      sessionStorage.setItem('unidadesCarrera', JSON.stringify(safeUcList));
    } else {
      sessionStorage.removeItem('unidadesCarrera');
    }
  };

  const setUnidadesCarreraPorAnoPersist = (ucList) => {
    const safeUcList = ucList || {};
    setUnidadesCarreraPorAno(safeUcList);
    if (safeUcList) {
      sessionStorage.setItem('unidadesCarreraPorAno', JSON.stringify(safeUcList));
    } else {
      sessionStorage.removeItem('unidadesCarreraPorAno');
    }
  };

  const setUnidadesAprobadasPersist = (ucList) => {
    // Asegurar que ucList sea un array
    const safeUcList = Array.isArray(ucList) ? ucList : [];
    setUnidadesAprobadas(safeUcList);
    if (safeUcList) {
      sessionStorage.setItem('unidadesAprobadas', JSON.stringify(safeUcList));
    } else {
      sessionStorage.removeItem('unidadesAprobadas');
    }
  };

  const setUnidadesAprobadasPorAnoPersist = (ucList) => {
    const safeUcList = ucList || {};
    setUnidadesAprobadasPorAno(safeUcList);
    if (safeUcList) {
      sessionStorage.setItem('unidadesAprobadasPorAno', JSON.stringify(safeUcList));
    } else {
      sessionStorage.removeItem('unidadesAprobadasPorAno');
    }
  };

  const setUnidadesInscriptasPersist = (ucList) => {
    // Asegurar que ucList sea un array
    const safeUcList = Array.isArray(ucList) ? ucList : [];
    setUnidadesInscriptas(safeUcList);
    if (safeUcList) {
      sessionStorage.setItem('unidadesInscriptas', JSON.stringify(safeUcList));
    } else {
      sessionStorage.removeItem('unidadesInscriptas');
    }
  };

  const setUnidadesInscriptasPorAnoPersist = (ucList) => {
    const safeUcList = ucList || {};
    setUnidadesInscriptasPorAno(safeUcList);
    if (safeUcList) {
      sessionStorage.setItem('unidadesInscriptasPorAno', JSON.stringify(safeUcList));
    } else {
      sessionStorage.removeItem('unidadesInscriptasPorAno');
    }
  };

  const setUnidadesDisponiblesPorAnoPersist = (ucList) => {
    const safeUcList = ucList || {};
    setUnidadesDisponiblesPorAno(safeUcList);
    if (safeUcList) {
      sessionStorage.setItem('unidadesDisponiblesPorAno', JSON.stringify(safeUcList));
    } else {
      sessionStorage.removeItem('unidadesDisponiblesPorAno');
    }
  };

  const updateNotification = (newNotifications) => {
    setNotification(newNotifications);
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
        resetAlumnoState
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
