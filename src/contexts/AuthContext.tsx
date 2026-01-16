import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseconfig';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  subscriptionPlan: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string; // ID único do tenant (clínica/usuário)
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  tenantId: string | null; // ID do tenant atual
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  isAdmin: false,
  tenantId: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          // Buscar dados do usuário no Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const userDataObj = {
              id: user.uid,
              name: data.name,
              email: data.email,
              role: data.role || 'user',
              subscriptionPlan: data.subscriptionPlan || 'Básico',
              isActive: data.isActive !== false,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              tenantId: data.tenantId || user.uid, // Usar UID como tenantId se não existir
            };
            
            setUserData(userDataObj);
            setTenantId(userDataObj.tenantId);
            
            // Salvar no localStorage para persistência
            localStorage.setItem('userRole', data.role || 'user');
            localStorage.setItem('userId', user.uid);
            localStorage.setItem('tenantId', userDataObj.tenantId);
          } else {
            // Se não encontrar dados no Firestore, criar dados básicos
            const userDataObj = {
              id: user.uid,
              name: user.displayName || 'Usuário',
              email: user.email || '',
              role: 'user',
              subscriptionPlan: 'Básico',
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              tenantId: user.uid, // Usar UID como tenantId padrão
            };
            
            setUserData(userDataObj);
            setTenantId(userDataObj.tenantId);
            
            localStorage.setItem('userRole', 'user');
            localStorage.setItem('userId', user.uid);
            localStorage.setItem('tenantId', userDataObj.tenantId);
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
        setTenantId(null);
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('tenantId');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = userData?.role === 'admin';

  const value = {
    user,
    userData,
    loading,
    isAdmin,
    tenantId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};



