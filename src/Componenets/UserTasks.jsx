import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ListItem, Paper, ListItemText, Button, CircularProgress, Typography } from '@mui/material';

const UserTasks = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If the user is authenticated, set up Firestore listener
        const userQuery = query(collection(db, 'users'), where('email', '==', user.email));
        const unsubscribeFirestore = onSnapshot(userQuery, (querySnapshot) => {
          const fetchedUsers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUsers(fetchedUsers);
          setLoading(false); // Data fetched, set loading to false
        }, (error) => {
          console.error('Error fetching user:', error);
          setError('Failed to load user data.');
          setLoading(false);
        });

        // Cleanup the listener on unmount
        return () => {
          unsubscribeFirestore();
        };
      } else {
        setError('You need to be logged in to see your tasks.');
        setLoading(false);
      }
    });

    // Cleanup the auth listener on unmount
    return () => {
      unsubscribeAuth();
    };
  }, [auth, db]);

  const updateTaskStatus = async (userId) => {
    const newStatus = 'Completed'; // Mark as completed
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { status: newStatus, task: '', dueDate: null }); // Clear the task and due date

      // No need to update the users state here; Firestore will trigger the onSnapshot listener
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

  // Filter out completed tasks
  const activeUsers = users.filter(user => user.status !== 'Completed');

  return (
    <div className="task-manager">
      <Typography variant="h4" align="center">Your Tasks</Typography>
      {error && (
        <div className="error-container">
          <Typography color="error" align="center">{error}</Typography>
        </div>
      )}
      {activeUsers.length === 0 ? (
        <Typography align="center" color="error">All tasks are completed!</Typography>
      ) : (
        <div className="task-list">
          {activeUsers.map(user => (
            <ListItem key={user.id} component={Paper} elevation={1} sx={{ mb: 2 }}>
              <ListItemText
                primary={`Name: ${user.names}`} // Show user name
                secondary={
                  <Typography>
                    {user.task ? ( // Only show task if it exists
                      <div>{`Task: ${user.task}`}</div>
                    ) : (
                      <div style={{ color: 'red' }}>No task assigned</div> // Indicate no task assigned
                    )}
                    {/* Only show button if task exists and is not completed */}
                    {user.task && user.status !== 'Completed' && (
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
