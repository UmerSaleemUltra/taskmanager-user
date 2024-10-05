import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ListItem, Paper, ListItemText, Button, CircularProgress, Typography } from '@mui/material';

const UserTasks = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userQuery = query(collection(db, 'users'), where('email', '==', user.email));
          const querySnapshot = await getDocs(userQuery);

          if (!querySnapshot.empty) {
            const fetchedUsers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(fetchedUsers);
          } else {
            setError('No user found.');
          }
        } catch (err) {
          console.error('Error fetching user:', err);
          setError('Failed to load user data.');
        } finally {
          setLoading(false);
        }
      } else {
        setError('You need to be logged in to see your tasks.');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, db]);

  const updateTaskStatus = async (userId) => {
    const newStatus = 'Completed'; // Mark as completed
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { status: newStatus, task: '', dueDate: null }); // Clear the task and due date

      // Update the users list to reflect the change
      setUsers(prevUsers => 
        prevUsers.map(user =>
          user.id === userId ? { ...user, task: '', status: newStatus } : user
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update task status.');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <CircularProgress /> Loading tasks...
      </div>
    );
  }

  return (
    <div className="task-manager">
      <Typography variant="h4" align="center">Your Tasks</Typography>
      {error && (
        <div className="error-container">
          <Typography color="error" align="center">{error}</Typography>
        </div>
      )}
      {!error && users.length === 0 ? (
        <Typography align="center">No tasks assigned to you.</Typography>
      ) : (
        <div className="task-list">
          {users.map(user => (
            <ListItem key={user.id} component={Paper} elevation={1} sx={{ mb: 2 }}>
              <ListItemText
                primary={`Name: ${user.names}`}
                secondary={
                  <Typography>
                    <div>{`Task: ${user.task || 'No task assigned'}`}</div>
                    <div>{`Status: ${user.status === 'Completed' ? 'Task Completed' : user.status || 'N/A'}`}</div>
                    {user.status !== 'Completed' && (
                      <Button 
                        variant="outlined" 
                        onClick={() => updateTaskStatus(user.id)} 
                        sx={{ mt: 1 }}
                      >
                        Complete
                      </Button>
                    )}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </div>
      )}

      <style jsx>{`
        .task-manager {
          margin: 20px;
          font-family: Arial, sans-serif;
        }
        .loading {
          text-align: center;
          margin: 20px;
          font-size: 1.2em;
        }
        .error-container {
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default UserTasks;
