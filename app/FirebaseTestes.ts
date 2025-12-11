
/*

VERSAO FIREBASE PARA TESTES 


import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getReactNativePersistence, initializeAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ============================================
// FIREBASE CONFIG
// ============================================
const firebaseConfig = {
  apiKey: "AIzaSyCwVIED8PVoMUIqTNy6bR0D4WtCZvlkA50",
  authDomain: "itasks-c30b1.firebaseapp.com",
  projectId: "itasks-c30b1",
  storageBucket: "itasks-c30b1.firebasestorage.app",
  messagingSenderId: "854440399612",
  appId: "1:854440399612:web:ee598723e6a6533afafd79"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const db = getFirestore(app);

// ============================================
// FIREBASE SERVICE
// ============================================
import {
  getDoc,
  setDoc
} from 'firebase/firestore';


const FirebaseService = {
  // LOGIN
  signIn: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Buscar documento na Firestore usando o UID como ID
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return { ...userData, uid: user.uid };
      }
      return null;
    } catch (error) {
  console.log("ERRO NO LOGIN:", error);
  throw new Error(error.message);
}
  },

  // LOGOUT
  signOut: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  },

  // BUSCAR UTILIZADORES (só depois do login)
  getUsers: async () => {
    try {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      return users;
    } catch (error) {
      console.error('Erro ao buscar utilizadores:', error);
      return [];
    }
  },

  // CRIAR UTILIZADOR (gestor cria)
  addUser: async (userData) => {
    try {
      // Cria no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const uid = userCredential.user.uid;

      // Cria documento na Firestore com ID = uid
      const newUser = {
        uid,
        username: userData.username,
        email: userData.email,
        type: userData.type, // ex: 'user'
        createdAt: new Date(),
      };
      await setDoc(doc(db, 'users', uid), newUser);
      return { id: uid, ...newUser };
    } catch (error) {
      throw new Error('Erro ao criar utilizador: ' + error.message);
    }
  },

  // ELIMINAR UTILIZADOR
  deleteUser: async (userId) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      throw error;
    }
  },

  // ATUALIZAR UTILIZADOR
  updateUser: async (userId, updates) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, updates);
      return { id: userId, ...updates };
    } catch (error) {
      throw error;
    }
  },

  // BUSCAR TAREFAS
  getTasks: async () => {
    try {
      const q = query(collection(db, 'tasks'));
      const querySnapshot = await getDocs(q);
      const tasks = [];
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      return tasks;
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      return [];
    }
  },

  // CRIAR TAREFA
  addTask: async (taskData) => {
    try {
      const newTask = {
        ...taskData,
        status: 'ToDo',
        createdAt: new Date(),
        actualStart: null,
        actualEnd: null,
      };
      const docRef = await addDoc(collection(db, 'tasks'), newTask);
      return { id: docRef.id, ...newTask };
    } catch (error) {
      throw error;
    }
  },

  // ATUALIZAR TAREFA
  updateTask: async (taskId, updates) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, updates);
      return { id: taskId, ...updates };
    } catch (error) {
      throw error;
    }
  },
};


// ============================================
// TELA: LOGIN
// ============================================
function LoginScreen({ onSignIn, loading }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha email e password!');
      return;
    }
    onSignIn(email, password);
  };

  return (
    <View style={styles.loginContainer}>
      <Text style={styles.title}>iTasks</Text>
      <View style={styles.loginForm}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#666666"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#666666"
        />
        <TouchableOpacity
          style={[styles.button, styles.buttonBlue, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'A autenticar...' : 'Login'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================
// COMPONENTES 
// ============================================

function KanbanScreen({ authUser, tasks, users, onAddTask, onUpdateStatus, onUpdateTask, loading }) {
  const [showForm, setShowForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [sp, setSp] = useState('5');
  const [taskType, setTaskType] = useState('Feature');
  const [showProgrammerDropdown, setShowProgrammerDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const handleAddTask = () => {
    if (!taskTitle || !assignedTo) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }
    onAddTask({ title: taskTitle, assignedTo, sp: parseInt(sp), type: taskType, managerId: authUser.uid });
    setTaskTitle('');
    setAssignedTo('');
    setSp('5');
    setTaskType('Feature');
    setShowForm(false);
  };

  const filtered = tasks.filter(t => t.assignedTo === authUser.uid || authUser.type === 'Gestor');
  const todo = filtered.filter(t => t.status === 'ToDo');
  const doing = filtered.filter(t => t.status === 'Doing');
  const done = filtered.filter(t => t.status === 'Done');

  const TaskCard = ({ task }) => (
    <View style={styles.taskCard}>
      <Text style={styles.taskTitle}>{task.title}</Text>
      <Text style={styles.taskInfo}>{task.sp} SP • {task.type}</Text>
      {authUser.type === 'Programador' && task.assignedTo === authUser.uid && task.status === 'ToDo' && (
        <TouchableOpacity
          style={[styles.button, styles.buttonYellow]}
          onPress={() => onUpdateStatus(task.id, 'Doing')}
        >
          <Text style={styles.buttonText}>Começar</Text>
        </TouchableOpacity>
      )}
      {authUser.type === 'Programador' && task.assignedTo === authUser.uid && task.status === 'Doing' && (
        <TouchableOpacity
          style={[styles.button, styles.buttonGreen]}
          onPress={() => onUpdateStatus(task.id, 'Done')}
        >
          <Text style={styles.buttonText}>Concluir</Text>
        </TouchableOpacity>
      )}
      {authUser.type === 'Gestor' && task.status !== 'Done' && (
        <TouchableOpacity
          style={[styles.button, styles.buttonBlue, { marginTop: 8 }]}
          onPress={() => {
            // Implementar edição
          }}
        >
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Bem-vindo, {authUser.username}!</Text>
        {authUser.type === 'Gestor' && (
          <TouchableOpacity
            style={[styles.button, styles.buttonGreen]}
            onPress={() => setShowForm(true)}
          >
            <Text style={styles.buttonText}>+ Nova Tarefa</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Criar Nova Tarefa</Text>
            <TextInput
              style={styles.input}
              placeholder="Título"
              value={taskTitle}
              onChangeText={setTaskTitle}
              placeholderTextColor="#666666"
            />
            
            <Text style={styles.label}>Atribuir a:</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowProgrammerDropdown(!showProgrammerDropdown)}
            >
              <Text style={styles.dropdownButtonText}>
                {assignedTo ? users.find(u => u.uid === assignedTo)?.username : 'Selecione um Programador'}
              </Text>
            </TouchableOpacity>
            {showProgrammerDropdown && (
              <View style={styles.dropdownMenu}>
                {users.filter(u => u.type === 'Programador').map(u => (
                  <TouchableOpacity
                    key={u.uid}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setAssignedTo(u.uid);
                      setShowProgrammerDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{u.username}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TextInput
              style={styles.input}
              placeholder="Story Points"
              value={sp}
              onChangeText={setSp}
              keyboardType="numeric"
              placeholderTextColor="#666666"
            />

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, styles.buttonBlue, { flex: 1 }, loading && styles.buttonDisabled]}
                onPress={handleAddTask}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? 'A guardar...' : 'Guardar'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonGray, { flex: 1, marginLeft: 10 }]}
                onPress={() => setShowForm(false)}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.kanbanContainer}>
        <View style={styles.column}>
          <Text style={styles.columnTitle}>📋 To Do ({todo.length})</Text>
          {todo.map((t, idx) => <TaskCard key={`todo_${t.id}_${idx}`} task={t} />)}
        </View>

        <View style={styles.column}>
          <Text style={styles.columnTitle}>⚡ Doing ({doing.length})</Text>
          {doing.map((t, idx) => <TaskCard key={`doing_${t.id}_${idx}`} task={t} />)}
        </View>

        <View style={styles.column}>
          <Text style={styles.columnTitle}>✅ Done ({done.length})</Text>
          {done.map((t, idx) => (
            <View key={`done_${t.id}_${idx}`} style={[styles.taskCard, styles.taskCardDone]}>
              <Text style={[styles.taskTitle, styles.taskTitleDone]}>{t.title}</Text>
              <Text style={styles.taskInfo}>{t.sp} SP • {t.type}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================
// COMPONENTE PRINCIPAL: APP
// ============================================
export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('kanban');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);



  useEffect(() => {
    const loadData = async () => {
       if (!auth.currentUser) {
      console.log('Nenhum usuário autenticado ainda');
      return; // Sai do loadData se não houver login
    }
      try {
        const [usersData, tasksData] = await Promise.all([
          console.log('Usuário autenticado:', auth.currentUser),
          FirebaseService.getUsers(),
          FirebaseService.getTasks()
        ]);
        setUsers(usersData);
        setTasks(tasksData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    loadData();
  }, []);

  const handleSignIn = async (email, password) => {
    setLoading(true);
    try {
      const user = await FirebaseService.signIn(email, password);
      if (user) {
        setAuthUser(user);
        setCurrentPage('kanban');
      } else {
        Alert.alert('Erro', 'Utilizador não encontrado!');
      }
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await FirebaseService.signOut();
      setAuthUser(null);
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
    setLoading(false);
  };

  const handleAddTask = async (taskData) => {
    setLoading(true);
    try {
      const newTask = await FirebaseService.addTask(taskData);
      setTasks([...tasks, newTask]);
      Alert.alert('Sucesso', 'Tarefa criada com sucesso!');
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
    setLoading(false);
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.status === 'Done') {
      Alert.alert('Erro', 'Tarefas concluídas não podem ser alteradas!');
      return;
    }

    if (newStatus === 'Doing') {
      const doingCount = tasks.filter(t => t.assignedTo === task.assignedTo && t.status === 'Doing').length;
      if (doingCount >= 2) {
        Alert.alert('Erro', 'Máximo 2 tarefas em Doing!');
        return;
      }
    }

    setLoading(true);
    try {
      const updates = { status: newStatus };
      if (newStatus === 'Doing' && !task.actualStart) {
        updates.actualStart = new Date();
      }
      if (newStatus === 'Done' && !task.actualEnd) {
        updates.actualEnd = new Date();
      }

      await FirebaseService.updateTask(taskId, updates);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
    setLoading(false);
  };

  if (!authUser) {
    return <LoginScreen onSignIn={handleSignIn} loading={loading} />;
  }

  return (
    <View style={styles.appContainer}>
      <View style={styles.topBar}>
        <Text style={styles.appTitle}>iTasks</Text>
        <View style={styles.navButtons}>
          <TouchableOpacity
            style={[styles.navButton, currentPage === 'kanban' && styles.navButtonActive]}
            onPress={() => setCurrentPage('kanban')}
          >
            <Text style={styles.navButtonText}>Kanban</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonLogout]}
            onPress={handleLogout}
          >
            <Text style={styles.navButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      {currentPage === 'kanban' && (
        <KanbanScreen
          authUser={authUser}
          tasks={tasks}
          users={users}
          onAddTask={handleAddTask}
          onUpdateStatus={handleUpdateTaskStatus}
          loading={loading}
        />
      )}
    </View>
  );
}
// ============================================
// ESTILOS
// ============================================
const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -1.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#999999',
    marginBottom: 48,
    letterSpacing: 1.2,
  },
  loginForm: {
    width: '100%',
    gap: 14,
  },
  input: {
    borderWidth: 0,
    borderColor: '#444444',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: '#ffffff',
    backgroundColor: '#3a3a3a',
    marginBottom: 10,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonBlue: {
    backgroundColor: '#444444',
  },
  buttonGreen: {
    backgroundColor: '#444444',
  },
  buttonYellow: {
    backgroundColor: '#444444',
  },
  buttonRed: {
    backgroundColor: '#ff4444',
  },
  buttonGray: {
    backgroundColor: '#333333',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  hint: {
    color: '#777777',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  topBar: {
    backgroundColor: '#2a2a2a',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 0,
    backgroundColor: '#333333',
  },
  navButtonActive: {
    backgroundColor: '#555555',
  },
  navButtonLogout: {
    backgroundColor: '#ff5555',
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 14,
  },
  kanbanContainer: {
    flexDirection: 'column',
    padding: 16,
    gap: 20,
  },
  column: {
    flex: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    borderWidth: 0,
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 14,
    color: '#ffffff',
    letterSpacing: 0.5,
    backgroundColor: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 6,
    textAlign: 'left',
  },
  taskCard: {
    backgroundColor: '#2a2a2a',
    borderLeftWidth: 0,
    borderLeftColor: '#1a1a1a',
    borderRadius: 6,
    padding: 14,
    marginBottom: 10,
    marginTop: 0,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  taskCardDone: {
    backgroundColor: '#252525',
    opacity: 1,
    borderColor: '#2a2a2a',
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#666666',
  },
  taskInfo: {
    fontSize: 11,
    color: '#888888',
    marginBottom: 10,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
    gap: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 18,
  },
  usersList: {
    padding: 16,
    gap: 12,
  },
  userCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  userEmail: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },
  userType: {
    fontSize: 11,
    color: '#999999',
    marginTop: 4,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10,
    marginTop: 12,
    letterSpacing: 0.3,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    backgroundColor: '#2a2a2a',
  },
  dropdownButtonText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '600',
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#2a2a2a',
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '600',
  },
  noData: {
    fontSize: 16,
    color: '#777777',
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
  },
  typeContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    marginBottom: 16,
  },
  typeText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  avatarSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarTextSmall: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  avatarLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
});


*/

/*
*/
