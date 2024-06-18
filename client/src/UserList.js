import React, {useEffect, useState} from 'react';
import axios from 'axios';
const UserList = () => {
    const [users, setUsers] = useState([]);


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const result = await axios.get('http://localhost:5001/api/users');
                setUsers(result.data); // Update users state with fetched data
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);
    

    return (
        <div>
            <h2>UserList</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>gender</th>
                    </tr>
                </thead>
                <body>
                    {users.map(user => (
                        <tr key={user.name}>
                            <td>{user.name}</td>
                            <td>{user.gender}</td>
                        </tr>
                    ))}
                </body>
            </table>

        </div>
    );
}
export default UserList;