import React from 'react';
import { AuthProvider } from './AuthProvider';
import Routes from '../screens/Routes';

// interface User {
//   id: string;
//   username: string;
//   email: string;
//   token: string;
// }

interface Props {
  user: React.Context<{}>;
  setUser: React.Context<{}>;
}

const Providers: React.FC<Props> = ({ user, setUser }) => {
  return (
    <AuthProvider>
      <Routes user={user} setUser={setUser} />
    </AuthProvider>
  );
};

export default Providers;