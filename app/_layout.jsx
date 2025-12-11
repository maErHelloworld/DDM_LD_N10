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
// SIMULAÇÃO FIREBASE
// ============================================
let taskIdCounter = 10000;
let userIdCounter = 10000;

const firebaseDB = {
  users: [
    { id: 'user_1', username: 'joao_gestor', email: 'joao@test.com', type: 'Gestor', password: '123456' },
    { id: 'user_3', username: 'pedro_prog', email: 'pedro@test.com', type: 'Programador', managerId: 'user_1', password: '123456' }
  ],
  tasks: [
    { id: 'task_1', title: 'API Login', managerId: 'user_1', assignedTo: 'user_2', status: 'Done', order: 1, sp: 5, type: 'Feature', actualStart: new Date('2025-01-06'), actualEnd: new Date('2025-01-08') },
    { id: 'task_2', title: 'Database Setup', managerId: 'user_1', assignedTo: 'user_3', status: 'Doing', order: 1, sp: 3, type: 'Setup', actualStart: new Date('2025-01-07'), actualEnd: null },
    { id: 'task_3', title: 'UI Components', managerId: 'user_1', assignedTo: 'user_2', status: 'ToDo', order: 2, sp: 8, type: 'Feature', actualStart: null, actualEnd: null },
    { id: 'task_4', title: 'Frontend Design', managerId: 'user_1', assignedTo: 'user_3', status: 'Done', order: 2, sp: 5, type: 'Feature', actualStart: new Date('2025-01-03'), actualEnd: new Date('2025-01-07') }
  ]
};

// ============================================
// FIREBASE SERVICE
// ============================================
const FirebaseService = {
  signIn: async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = firebaseDB.users.find(u => u.email === email && u.password === password);
        if (user) resolve(user);
        else reject(new Error('Email ou password inválidos!'));
      }, 500);
    });
  },
  signOut: async () => Promise.resolve(),
  getUsers: async () => new Promise(resolve => setTimeout(() => resolve(firebaseDB.users), 300)),
  getTasks: async () => new Promise(resolve => setTimeout(() => resolve(firebaseDB.tasks), 300)),
  addTask: async (taskData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTask = { ...taskData, id: `task_${++taskIdCounter}`, status: 'ToDo', actualStart: null, actualEnd: null };
        firebaseDB.tasks.push(newTask);
        resolve(newTask);
      }, 300);
    });
  },
  updateTask: async (taskId, updates) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = firebaseDB.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          firebaseDB.tasks[index] = { ...firebaseDB.tasks[index], ...updates };
          resolve(firebaseDB.tasks[index]);
        }
      }, 300);
    });
  },
  addUser: async (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = { ...userData, id: `user_${++userIdCounter}` };
        firebaseDB.users.push(newUser);
        resolve(newUser);
      }, 300);
    });
  },
  deleteUser: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        firebaseDB.users = firebaseDB.users.filter(u => u.id !== userId);
        resolve();
      }, 300);
    });
  }
};

// ============================================
// TELA: LOGIN
// ============================================
function LoginScreen({ onSignIn, loading }) {
  const [email, setEmail] = useState('joao@test.com');
  const [password, setPassword] = useState('123456');

  const handleLogin = () => {
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
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#999"
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
      <Text style={styles.hint}>Demo: joao@test.com | Password: 123456</Text>
    </View>
  );
}

// ============================================
// TELA: KANBAN
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
    onAddTask({ title: taskTitle, assignedTo, sp: parseInt(sp), type: taskType });
    setTaskTitle('');
    setAssignedTo('');
    setSp('5');
    setTaskType('Feature');
    setShowForm(false);
  };

  const filtered = tasks.filter(t => t.assignedTo === authUser.id || authUser.type === 'Gestor');
  const todo = filtered.filter(t => t.status === 'ToDo');
  const doing = filtered.filter(t => t.status === 'Doing');
  const done = filtered.filter(t => t.status === 'Done');

  const TaskCard = ({ task }) => (
    <View style={styles.taskCard}>
      <Text style={styles.taskTitle}>{task.title}</Text>
      <Text style={styles.taskInfo}>{task.sp} SP • {task.type}</Text>
      {authUser.type === 'Programador' && task.assignedTo === authUser.id && task.status === 'ToDo' && (
        <TouchableOpacity
          style={[styles.button, styles.buttonYellow]}
          onPress={() => onUpdateStatus(task.id, 'Doing')}
        >
          <Text style={styles.buttonText}>Começar</Text>
        </TouchableOpacity>
      )}
      {authUser.type === 'Programador' && task.assignedTo === authUser.id && task.status === 'Doing' && (
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
              placeholderTextColor="#999"
            />
            
            <Text style={styles.label}>Atribuir a:</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowProgrammerDropdown(!showProgrammerDropdown)}
            >
              <Text style={styles.dropdownButtonText}>
                {assignedTo ? users.find(u => u.id === assignedTo)?.username : 'Selecione um Programador'}
              </Text>
            </TouchableOpacity>
            {showProgrammerDropdown && (
              <View style={styles.dropdownMenu}>
                {users.filter(u => u.type === 'Programador').map(u => (
                  <TouchableOpacity
                    key={u.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setAssignedTo(u.id);
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
              placeholderTextColor="#999"
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
              placeholderTextColor="#999"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Story Points"
              value={editSp}
              onChangeText={setEditSp}
              keyboardType="numeric"
              placeholderTextColor="#999"
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
// TELA: UTILIZADORES
// ============================================
function UsersScreen({ authUser, users, onAddUser, onDeleteUser, loading }) {
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAddUser = () => {
    if (!username || !email) {
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
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#999"
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
          <View key={`user_${u.id}_${idx}`} style={styles.userCard}>
            <View>
              <Text style={styles.userName}>{u.username}</Text>
              <Text style={styles.userEmail}>{u.email}</Text>
              <Text style={styles.userType}>{u.type}</Text>
            </View>
            {authUser.id !== u.id && (
              <TouchableOpacity
                style={[styles.button, styles.buttonRed]}
                onPress={() => onDeleteUser(u.id)}
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
// TELA: TAREFAS CONCLUÍDAS
// ============================================
function CompletedPage({ authUser, tasks, users }) {
  const completed = tasks.filter(t => t.status === 'Done' && t.managerId === authUser.id);

  const handleExportCSV = () => {
    try {
      const csvData = 'Programador,Tarefa,Tipo,SP\n' + completed.map(t => {
        const prog = users.find(u => u.id === t.assignedTo);
        return `${prog?.username || '-'},${t.title},${t.type},${t.sp}`;
      }).join('\n');

      Alert.alert('CSV Gerado', csvData);
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
            const prog = users.find(u => u.id === t.assignedTo);
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
      try {
        const [usersData, tasksData] = await Promise.all([
          FirebaseService.getUsers(),
          FirebaseService.getTasks()
        ]);
        const uniqueUsers = Array.from(new Map(usersData.map(item => [item.id, item])).values());
        const uniqueTasks = Array.from(new Map(tasksData.map(item => [item.id, item])).values());
        setUsers(uniqueUsers);
        setTasks(uniqueTasks);
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
      setAuthUser(user);
      setCurrentPage('kanban');
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
      console.error('Erro ao fazer logout:', error);
    }
    setLoading(false);
  };

  const handleAddTask = async (taskData) => {
    setLoading(true);
    try {
      const task = await FirebaseService.addTask({
        ...taskData,
        managerId: authUser.id,
        order: 1
      });
      const allTasks = await FirebaseService.getTasks();
      setTasks(allTasks);
      Alert.alert('Sucesso', 'Tarefa criada com sucesso!');
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
    setLoading(false);
  };

  const handleAddUser = async (userData) => {
    setLoading(true);
    try {
      const user = await FirebaseService.addUser(userData);
      const allUsers = await FirebaseService.getUsers();
      setUsers(allUsers);
      Alert.alert('Sucesso', 'Utilizador criado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId) => {
    if (authUser.id === userId) {
      Alert.alert('Erro', 'Não podes eliminar o teu próprio utilizador!');
      return;
    }
    setLoading(true);
    try {
      await FirebaseService.deleteUser(userId);
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      Alert.alert('Sucesso', 'Utilizador eliminado com sucesso!');
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
      setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
    setLoading(false);
  };

  const handleUpdateTask = async (taskId, updates) => {
    setLoading(true);
    try {
      await FirebaseService.updateTask(taskId, updates);
      const allTasks = await FirebaseService.getTasks();
      setTasks(allTasks);
      Alert.alert('Sucesso', 'Tarefa atualizada com sucesso!');
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
    </View>
  );
}

// ============================================
// ESTILOS
// ============================================
const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    backgroundColor: '#009191ff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  loginForm: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#000',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonBlue: {
    backgroundColor: '#0a9986ff',
  },
  buttonGreen: {
    backgroundColor: '#16a34a',
  },
  buttonYellow: {
    backgroundColor: '#eab308',
  },
  buttonRed: {
    backgroundColor: '#a03f3fff',
  },
  buttonGray: {
    backgroundColor: '#9ca3af',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    marginTop: 10,
  },
  hint: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  topBar: {
    backgroundColor: '#03be96ff',
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  navButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  navButtonLogout: {
    backgroundColor: '#a04949ff',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  kanbanContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
  },
  column: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1f2937',
  },
  taskCard: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#008f94ff',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  taskCardDone: {
    borderLeftColor: '#3f9790ff',
    opacity: 0.7,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
  },
  taskInfo: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  usersList: {
    padding: 12,
    gap: 10,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  userEmail: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  userType: {
    fontSize: 12,
    color: '#338a74ff',
    marginTop: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 10,
  },
  picker: {
    height: 50,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#000',
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1f2937',
  },
  noData: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 20,
  },
});