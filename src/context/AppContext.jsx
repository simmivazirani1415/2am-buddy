import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import {
  MOCK_USER,
  MOCK_EMERGENCY_CONTACT,
  MOCK_PRIVACY,
  MOCK_HISTORY,
  MOCK_REMINDERS,
  MOCK_CONNECTED_ACCOUNTS,
  DAILY_THOUGHTS,
  buildShareDraft,
} from '../lib/mockData';

const AppContext = createContext(null);

const DEFAULT_SLOTS = [
  { id: 'slot-1', label: 'Today 11:00 AM', available: true },
  { id: 'slot-2', label: 'Today 2:00 PM', available: true, recommended: true },
  { id: 'slot-3', label: 'Tomorrow 10:00 AM', available: true },
];

const DEFAULT_COUNSELOR = {
  id: 'dr-aisha',
  name: 'Dr. Aisha Verma',
  title: 'Clinical Psychologist',
  rating: 4.9,
  reviews: 120,
  image:
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80',
};

const initialState = {
  // ── voice/booking (unchanged) ───────────────────────────────────────────
  currentScreen: 1,
  selectedMood: null,
  callStatus: 'idle',
  callStartTime: null,
  conversationHistory: [],
  riskLevel: 'low',
  riskDetected: false,
  selectedCounselor: null,
  selectedTimeSlot: null,
  availableSlots: DEFAULT_SLOTS,
  bookingConfirmed: false,
  loading: false,
  toastMessage: null,
  toastType: 'info',

  // ── tabs additions (spec §7) ────────────────────────────────────────────
  user: MOCK_USER,
  emergencyContact: MOCK_EMERGENCY_CONTACT,
  privacy: MOCK_PRIVACY,
  history: MOCK_HISTORY,
  shareDraft: { items: [], included: {} },
  dailyThoughts: DAILY_THOUGHTS,
  reminders: MOCK_REMINDERS,
  connectedAccounts: MOCK_CONNECTED_ACCOUNTS,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, currentScreen: action.payload };
    case 'SET_MOOD':
      return { ...state, selectedMood: action.payload };
    case 'SET_CALL_STATUS':
      return {
        ...state,
        callStatus: action.payload,
        callStartTime:
          action.payload === 'connected' && !state.callStartTime
            ? new Date()
            : action.payload === 'idle'
              ? null
              : state.callStartTime,
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        conversationHistory: [
          ...state.conversationHistory,
          {
            role: action.payload.role,
            content: action.payload.content,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    case 'SET_RISK': {
      const { detected, level } = action.payload;
      return {
        ...state,
        riskDetected: detected,
        riskLevel: level ?? state.riskLevel,
      };
    }
    case 'SELECT_COUNSELOR':
      return { ...state, selectedCounselor: action.payload };
    case 'SELECT_SLOT':
      return { ...state, selectedTimeSlot: action.payload };
    case 'CONFIRM_BOOKING':
      return { ...state, bookingConfirmed: true };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SHOW_TOAST':
      return {
        ...state,
        toastMessage: action.payload.message,
        toastType: action.payload.type ?? 'info',
      };
    case 'CLEAR_TOAST':
      return { ...state, toastMessage: null };
    case 'RESET_CONVERSATION':
      return {
        ...state,
        conversationHistory: [],
        callStatus: 'idle',
        callStartTime: null,
        riskDetected: false,
        riskLevel: 'low',
        selectedMood: null,
        selectedCounselor: null,
        selectedTimeSlot: null,
        bookingConfirmed: false,
      };

    // ── tabs additions ───────────────────────────────────────────────────
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'SET_EMERGENCY_CONTACT':
      return { ...state, emergencyContact: action.payload };
    case 'UPDATE_PRIVACY':
      return {
        ...state,
        privacy: {
          ...state.privacy,
          ...action.payload,
          expertVisibility: {
            ...state.privacy.expertVisibility,
            ...(action.payload?.expertVisibility ?? {}),
          },
        },
      };
    case 'ADD_HISTORY_ENTRY':
      return { ...state, history: [action.payload, ...state.history] };
    case 'DELETE_HISTORY_ENTRY':
      return {
        ...state,
        history: state.history.filter((h) => h.id !== action.payload),
      };
    case 'SET_FEEDBACK': {
      const { id, value } = action.payload;
      return {
        ...state,
        history: state.history.map((h) =>
          h.id === id ? { ...h, feedback: value } : h
        ),
      };
    }
    case 'SET_HISTORY_NOTE': {
      const { id, note } = action.payload;
      return {
        ...state,
        history: state.history.map((h) =>
          h.id === id ? { ...h, note } : h
        ),
      };
    }
    case 'PREPARE_SHARE':
      return { ...state, shareDraft: action.payload };
    case 'TOGGLE_SHARE_ITEM':
      return {
        ...state,
        shareDraft: {
          ...state.shareDraft,
          included: {
            ...state.shareDraft.included,
            [action.payload]: !state.shareDraft.included[action.payload],
          },
        },
      };
    case 'CONFIRM_SHARE':
      return { ...state, shareDraft: { items: [], included: {} } };

    case 'ADD_REMINDER':
      return { ...state, reminders: [...state.reminders, action.payload] };
    case 'UPDATE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload.patch } : r
        ),
      };
    case 'REMOVE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.filter((r) => r.id !== action.payload),
      };
    case 'SET_CONNECTED_ACCOUNT':
      return {
        ...state,
        connectedAccounts: {
          ...state.connectedAccounts,
          [action.payload.key]: action.payload.value,
        },
      };
    case 'UNLINK_ALL_ACCOUNTS':
      return {
        ...state,
        connectedAccounts: Object.keys(state.connectedAccounts).reduce(
          (acc, k) => ({ ...acc, [k]: false }),
          {}
        ),
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setCurrentScreen = useCallback(
    (n) => dispatch({ type: 'SET_SCREEN', payload: n }),
    []
  );
  const setMood = useCallback(
    (mood) => dispatch({ type: 'SET_MOOD', payload: mood }),
    []
  );
  const setCallStatus = useCallback(
    (status) => dispatch({ type: 'SET_CALL_STATUS', payload: status }),
    []
  );
  const addToConversation = useCallback(
    (role, content) =>
      dispatch({ type: 'ADD_MESSAGE', payload: { role, content } }),
    []
  );
  const setRiskDetected = useCallback(
    (detected, level) =>
      dispatch({ type: 'SET_RISK', payload: { detected, level } }),
    []
  );
  const selectCounselor = useCallback(
    (counselor) =>
      dispatch({
        type: 'SELECT_COUNSELOR',
        payload: counselor ?? DEFAULT_COUNSELOR,
      }),
    []
  );
  const selectTimeSlot = useCallback(
    (slot) => dispatch({ type: 'SELECT_SLOT', payload: slot }),
    []
  );
  const confirmBooking = useCallback(
    () => dispatch({ type: 'CONFIRM_BOOKING' }),
    []
  );
  const setLoading = useCallback(
    (v) => dispatch({ type: 'SET_LOADING', payload: v }),
    []
  );
  const showToast = useCallback(
    (message, type = 'info') =>
      dispatch({ type: 'SHOW_TOAST', payload: { message, type } }),
    []
  );
  const clearToast = useCallback(() => dispatch({ type: 'CLEAR_TOAST' }), []);
  const resetConversation = useCallback(
    () => dispatch({ type: 'RESET_CONVERSATION' }),
    []
  );

  // ── tabs actions ───────────────────────────────────────────────────────
  const updateUser = useCallback(
    (patch) => dispatch({ type: 'UPDATE_USER', payload: patch }),
    []
  );
  const setEmergencyContact = useCallback(
    (contact) => dispatch({ type: 'SET_EMERGENCY_CONTACT', payload: contact }),
    []
  );
  const updatePrivacy = useCallback(
    (patch) => dispatch({ type: 'UPDATE_PRIVACY', payload: patch }),
    []
  );
  const addHistoryEntry = useCallback(
    (entry) => dispatch({ type: 'ADD_HISTORY_ENTRY', payload: entry }),
    []
  );
  const deleteHistoryEntry = useCallback(
    (id) => dispatch({ type: 'DELETE_HISTORY_ENTRY', payload: id }),
    []
  );
  const setFeedback = useCallback(
    (id, value) =>
      dispatch({ type: 'SET_FEEDBACK', payload: { id, value } }),
    []
  );
  const setHistoryNote = useCallback(
    (id, note) =>
      dispatch({ type: 'SET_HISTORY_NOTE', payload: { id, note } }),
    []
  );

  // Builds the share-draft preview from current history.
  const prepareShare = useCallback(() => {
    const draft = buildShareDraft(state.history);
    dispatch({ type: 'PREPARE_SHARE', payload: draft });
    return draft;
  }, [state.history]);

  const toggleShareItem = useCallback(
    (id) => dispatch({ type: 'TOGGLE_SHARE_ITEM', payload: id }),
    []
  );
  const confirmShare = useCallback(
    () => dispatch({ type: 'CONFIRM_SHARE' }),
    []
  );

  const addReminder = useCallback(
    (reminder) => dispatch({ type: 'ADD_REMINDER', payload: reminder }),
    []
  );
  const updateReminder = useCallback(
    (id, patch) =>
      dispatch({ type: 'UPDATE_REMINDER', payload: { id, patch } }),
    []
  );
  const removeReminder = useCallback(
    (id) => dispatch({ type: 'REMOVE_REMINDER', payload: id }),
    []
  );
  const setConnectedAccount = useCallback(
    (key, value) =>
      dispatch({ type: 'SET_CONNECTED_ACCOUNT', payload: { key, value } }),
    []
  );
  const unlinkAllAccounts = useCallback(
    () => dispatch({ type: 'UNLINK_ALL_ACCOUNTS' }),
    []
  );

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!state.toastMessage) return;
    const t = setTimeout(() => clearToast(), 3000);
    return () => clearTimeout(t);
  }, [state.toastMessage, clearToast]);

  const value = useMemo(
    () => ({
      ...state,
      defaultCounselor: DEFAULT_COUNSELOR,
      setCurrentScreen,
      setMood,
      setCallStatus,
      addToConversation,
      setRiskDetected,
      selectCounselor,
      selectTimeSlot,
      confirmBooking,
      setLoading,
      showToast,
      clearToast,
      resetConversation,
      // tabs
      updateUser,
      setEmergencyContact,
      updatePrivacy,
      addHistoryEntry,
      deleteHistoryEntry,
      setFeedback,
      setHistoryNote,
      prepareShare,
      toggleShareItem,
      confirmShare,
      addReminder,
      updateReminder,
      removeReminder,
      setConnectedAccount,
      unlinkAllAccounts,
    }),
    [
      state,
      setCurrentScreen,
      setMood,
      setCallStatus,
      addToConversation,
      setRiskDetected,
      selectCounselor,
      selectTimeSlot,
      confirmBooking,
      setLoading,
      showToast,
      clearToast,
      resetConversation,
      updateUser,
      setEmergencyContact,
      updatePrivacy,
      addHistoryEntry,
      deleteHistoryEntry,
      setFeedback,
      setHistoryNote,
      prepareShare,
      toggleShareItem,
      confirmShare,
      addReminder,
      updateReminder,
      removeReminder,
      setConnectedAccount,
      unlinkAllAccounts,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
