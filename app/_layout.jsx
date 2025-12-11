// |||| VERSAO SEM ESTAR LIGADA A FIREBASE REAL!!!!!   //

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getReactNativePersistence, initializeAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc } from 'firebase/firestore';
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
const FirebaseService = {
 
  signIn: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

    
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

 
  signOut: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  },

  
  getUsers: async () => {
    try {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({ uid: doc.id, ...doc.data() });
      });
      return users;
    } catch (error) {
      console.error('Erro ao buscar utilizadores:', error);
      return [];
    }
  },

 
  addUser: async (userData) => {
    try {
     
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const uid = userCredential.user.uid;

      
      const newUser = {
        uid,
        username: userData.username,
        email: userData.email,
        type: userData.type || 'Programador',
        createdAt: new Date(),
      };
      await setDoc(doc(db, 'users', uid), newUser);
      return { uid, ...newUser };
    } catch (error) {
      throw new Error('Erro ao criar utilizador: ' + error.message);
    }
  },

  
  deleteUser: async (userId) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      throw error;
    }
  },


  updateUser: async (userId, updates) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, updates);
      return { uid: userId, ...updates };
    } catch (error) {
      throw error;
    }
  },

  
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

 
  updateTask: async (taskId, updates) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, updates);
      return { id: taskId, ...updates };
    } catch (error) {
      throw error;
    }
  },

 
  deleteTask: async (taskId) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      throw error;
    }
  },
};

// ============================================
// LOGIN
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
          autoCapitalize="none"
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
// KANBAN
// ============================================
function KanbanScreen({ authUser, tasks, users, onAddTask, onUpdateStatus, onUpdateTask, loading }) {
  const [showForm, setShowForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [sp, setSp] = useState('5');
  const [taskType, setTaskType] = useState('Feature');
  const [showProgrammerDropdown, setShowProgrammerDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSp, setEditSp] = useState('5');
  const [editType, setEditType] = useState('Feature');
  const [showEditTypeDropdown, setShowEditTypeDropdown] = useState(false);

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
      <Text style={styles.taskAssigned}>
        👤 {users.find(u => u.uid === task.assignedTo)?.username || 'N/A'}
      </Text>
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
            setEditingTaskId(task.id);
            setEditTitle(task.title);
            setEditSp(String(task.sp));
            setEditType(task.type);
            setShowEditForm(true);
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

            <Text style={styles.label}>Tipo:</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowTypeDropdown(!showTypeDropdown)}
            >
              <Text style={styles.dropdownButtonText}>{taskType}</Text>
            </TouchableOpacity>
            {showTypeDropdown && (
              <View style={styles.dropdownMenu}>
                {['Feature', 'Bug', 'Setup'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setTaskType(type);
                      setShowTypeDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

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
                onPress={() => {
                  setShowForm(false);
                  setShowProgrammerDropdown(false);
                  setShowTypeDropdown(false);
                }}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

     
      <Modal visible={showEditForm} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Tarefa</Text>
            <TextInput
              style={styles.input}
              placeholder="Título"
              value={editTitle}
              onChangeText={setEditTitle}
              placeholderTextColor="#666666"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Story Points"
              value={editSp}
              onChangeText={setEditSp}
              keyboardType="numeric"
              placeholderTextColor="#666666"
            />

            <Text style={styles.label}>Tipo:</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowEditTypeDropdown(!showEditTypeDropdown)}
            >
              <Text style={styles.dropdownButtonText}>{editType}</Text>
            </TouchableOpacity>
            {showEditTypeDropdown && (
              <View style={styles.dropdownMenu}>
                {['Feature', 'Bug', 'Setup'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setEditType(type);
                      setShowEditTypeDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, styles.buttonBlue, { flex: 1 }, loading && styles.buttonDisabled]}
                onPress={() => {
                  if (!editTitle) {
                    Alert.alert('Erro', 'Preencha o título!');
                    return;
                  }
                  onUpdateTask(editingTaskId, { title: editTitle, sp: parseInt(editSp), type: editType });
                  setShowEditForm(false);
                }}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? 'A guardar...' : 'Guardar'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonGray, { flex: 1, marginLeft: 10 }]}
                onPress={() => {
                  setShowEditForm(false);
                  setShowEditTypeDropdown(false);
                }}
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
          <Text style={styles.columnTitle}>To Do ({todo.length})</Text>
          {todo.map((t, idx) => <TaskCard key={`todo_${t.id}_${idx}`} task={t} />)}
        </View>

        <View style={styles.column}>
          <Text style={styles.columnTitle}>Doing ({doing.length})</Text>
          {doing.map((t, idx) => <TaskCard key={`doing_${t.id}_${idx}`} task={t} />)}
        </View>

        <View style={styles.column}>
          <Text style={styles.columnTitle}>Done ({done.length})</Text>
          {done.map((t, idx) => (
            <View key={`done_${t.id}_${idx}`} style={[styles.taskCard, styles.taskCardDone]}>
              <Text style={[styles.taskTitle, styles.taskTitleDone]}>{t.title}</Text>
              <Text style={styles.taskInfo}>{t.sp} SP • {t.type}</Text>
              <Text style={styles.taskAssigned}>
                👤 {users.find(u => u.uid === t.assignedTo)?.username || 'N/A'}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}



// ============================================
// GESTÃO DE UTILIZADORES
// ============================================
function UsersScreen({ authUser, users, onAddUser, onDeleteUser, loading }) {
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAddUser = () => {
    if (!username || !email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }
    onAddUser({ username, email, password, type: 'Programador' });
    setUsername('');
    setEmail('');
    setPassword('');
    setShowForm(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Gestão de Utilizadores</Text>
        <TouchableOpacity
          style={[styles.button, styles.buttonGreen]}
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.buttonText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Criar Novo Utilizador</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              placeholderTextColor="#666666"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#666666"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#666666"
            />
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, styles.buttonBlue, { flex: 1 }, loading && styles.buttonDisabled]}
                onPress={handleAddUser}
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

      <View style={styles.usersList}>
        {users.map((u, idx) => (
          <View key={`user_${u.uid}_${idx}`} style={styles.userCard}>
            <View>
              <Text style={styles.userName}>{u.username}</Text>
              <Text style={styles.userEmail}>{u.email}</Text>
              <Text style={styles.userType}>{u.type}</Text>
            </View>
            {authUser.uid !== u.uid && (
              <TouchableOpacity
                style={[styles.button, styles.buttonRed]}
                onPress={() => onDeleteUser(u.uid)}
              >
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ============================================
// TAREFAS CONCLUÍDAS
// ============================================
function CompletedPage({ authUser, tasks, users }) {
  const completed = tasks.filter(t => t.status === 'Done' && t.managerId === authUser.uid);

  const handleExportCSV = () => {
    try {
      const csvData = 'Programador,Tarefa,Tipo,SP\n' + completed.map(t => {
        const prog = users.find(u => u.uid === t.assignedTo);
        return `${prog?.username || '-'},${t.title},${t.type},${t.sp}`;
      }).join('\n');

      Alert.alert('CSV Gerado com sucesso', csvData);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao gerar CSV');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Tarefas Concluídas</Text>
        <TouchableOpacity
          style={[styles.button, styles.buttonBlue]}
          onPress={handleExportCSV}
        >
          <Text style={styles.buttonText}>Exportar CSV</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.usersList}>
        {completed.length === 0 ? (
          <Text style={styles.noData}>Nenhuma tarefa concluída</Text>
        ) : (
          completed.map((t, idx) => {
            const prog = users.find(u => u.uid === t.assignedTo);
            return (
              <View key={`completed_${t.id}_${idx}`} style={styles.userCard}>
                <View>
                  <Text style={styles.userName}>{prog?.username || '-'}</Text>
                  <Text style={styles.userEmail}>{t.title}</Text>
                  <Text style={styles.userType}>{t.type} • {t.sp} SP</Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

// ============================================
// PERFIL
// ============================================
function ProfilePage({ authUser, users, onUpdateUser, loading }) {
  const [editingUser, setEditingUser] = useState(authUser);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleEditUser = (user) => {
    setEditingUser(user);
    setSelectedUserId(user.uid);
  };

  const handleSaveProfile = async () => {
    if (!editingUser.username || !editingUser.email) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }
    onUpdateUser(editingUser.uid, { username: editingUser.username, email: editingUser.email });
  };

  const getAvatarColor = (id) => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa502', '#6c5ce7', '#a29bfe'];
    const index = id ? id.charCodeAt(id.length - 1) % colors.length : 0;
    return colors[index];
  };

  const getInitials = (username) => {
    if (!username) return '??';
    return username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Meu Perfil</Text>
      </View>

      {authUser.type === 'Gestor' && (
        <View style={styles.usersList}>
          <Text style={styles.label}>Selecione utilizador para editar:</Text>
          {users.map(u => (
            <TouchableOpacity
              key={u.uid}
              style={[styles.userCard, selectedUserId === u.uid && { backgroundColor: '#3a3a3a' }]}
              onPress={() => handleEditUser(u)}
            >
              <View style={styles.userCardContent}>
                <View style={[styles.avatarSmall, { backgroundColor: getAvatarColor(u.uid) }]}>
                  <Text style={styles.avatarTextSmall}>{getInitials(u.username)}</Text>
                </View>
                <View>
                  <Text style={styles.userName}>{u.username}</Text>
                  <Text style={styles.userEmail}>{u.email}</Text>
                  <Text style={styles.userType}>{u.type}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ padding: 16 }}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: getAvatarColor(editingUser.uid) }]}>
            <Text style={styles.avatarText}>{getInitials(editingUser.username)}</Text>
          </View>
          <Text style={styles.avatarLabel}>{editingUser.username}</Text>
        </View>

        <Text style={[styles.label, { marginBottom: 16, fontSize: 16, marginTop: 20 }]}>
          {editingUser.uid === authUser.uid ? 'Editar Meu Perfil' : `Editar ${editingUser.username}`}
        </Text>

        <Text style={styles.label}>Nome de Utilizador:</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={editingUser.username}
          onChangeText={(text) => setEditingUser({ ...editingUser, username: text })}
          placeholderTextColor="#666666"
        />

        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={editingUser.email}
          onChangeText={(text) => setEditingUser({ ...editingUser, email: text })}
          placeholderTextColor="#666666"
        />

        <Text style={styles.label}>Tipo:</Text>
        <View style={styles.typeContainer}>
          <Text style={styles.typeText}>{editingUser.type}</Text>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.buttonBlue, { flex: 1 }, loading && styles.buttonDisabled]}
            onPress={handleSaveProfile}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'A guardar...' : 'Guardar Alterações'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================
// APP
// ============================================
export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('kanban');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Carregar dados após login
  const loadData = async () => {
    if (!auth.currentUser) {
      console.log('Nenhum utilizador autenticado');
      return;
    }
    try {
      const [usersData, tasksData] = await Promise.all([
        FirebaseService.getUsers(),
        FirebaseService.getTasks()
      ]);
      const uniqueUsers = Array.from(new Map(usersData.map(item => [item.uid, item])).values());
      const uniqueTasks = Array.from(new Map(tasksData.map(item => [item.id, item])).values());
      setUsers(uniqueUsers);
      setTasks(uniqueTasks);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [authUser]);

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
      setUsers([]);
      setTasks([]);
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

  const handleUpdateTask = async (taskId, updates) => {
    setLoading(true);
    try {
      await FirebaseService.updateTask(taskId, updates);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
      Alert.alert('Sucesso', 'Tarefa atualizada com sucesso!');
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
    setLoading(false);
  };

  const handleAddUser = async (userData) => {
    setLoading(true);
    try {
      const newUser = await FirebaseService.addUser(userData);
      setUsers([...users, newUser]);
      Alert.alert('Sucesso', 'Utilizador criado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId) => {
    if (authUser.uid === userId) {
      Alert.alert('Erro', 'Não podes eliminar o teu próprio utilizador!');
      return;
    }
    setLoading(true);
    try {
      await FirebaseService.deleteUser(userId);
      setUsers(users.filter(u => u.uid !== userId));
      Alert.alert('Sucesso', 'Utilizador eliminado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
    setLoading(false);
  };

  const handleUpdateUser = async (userId, updates) => {
    setLoading(true);
    try {
      await FirebaseService.updateUser(userId, updates);
      setUsers(users.map(u => u.uid === userId ? { ...u, ...updates } : u));
      if (userId === authUser.uid) {
        setAuthUser({ ...authUser, ...updates });
      }
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
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
          {authUser.type === 'Gestor' && (
            <>
              <TouchableOpacity
                style={[styles.navButton, currentPage === 'users' && styles.navButtonActive]}
                onPress={() => setCurrentPage('users')}
              >
                <Text style={styles.navButtonText}>Users</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navButton, currentPage === 'completed' && styles.navButtonActive]}
                onPress={() => setCurrentPage('completed')}
              >
                <Text style={styles.navButtonText}>Concluídas</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={[styles.navButton, currentPage === 'profile' && styles.navButtonActive]}
            onPress={() => setCurrentPage('profile')}
          >
            <Text style={styles.navButtonText}>Perfil</Text>
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
          onUpdateTask={handleUpdateTask}
          loading={loading}
        />
      )}

      {currentPage === 'users' && authUser.type === 'Gestor' && (
        <UsersScreen
          authUser={authUser}
          users={users}
          onAddUser={handleAddUser}
          onDeleteUser={handleDeleteUser}
          loading={loading}
        />
      )}

      {currentPage === 'completed' && authUser.type === 'Gestor' && (
        <CompletedPage
          authUser={authUser}
          tasks={tasks}
          users={users}
        />
      )}

      {currentPage === 'profile' && (
        <ProfilePage
          authUser={authUser}
          users={users}
          onUpdateUser={handleUpdateUser}
          loading={loading}
        />
      )}
    </View>
  );
}





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