import React, { useState, useEffect } from "react";
import api from '../api';
import { Link, useNavigate } from "react-router-dom";
import './dashboard.css';
import Sidebar from "./Sidebar";
import { MdDeleteForever } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { MdOutlineAddBox } from "react-icons/md";
import { FaFilter } from "react-icons/fa6";
import { GrLogout } from "react-icons/gr";

function Dashboard() {
    const [expenses, setExpenses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [deleteExpenseId, setDeleteExpenseId] = useState('');

    const [total, setTotal] = useState(0); // Added for pagination
    const [page, setPage] = useState(1); // Added for pagination
    const [limit, setLimit] = useState(10); // Added for pagination

    const [sortField, setSortField] = useState(''); // Added for sorting
    const [sortOrder, setSortOrder] = useState('asc'); // Added for sorting

    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filter, setFilter] = useState({
        name: '',
        amount: '',
        amountCondition: 'equal',
        paid: '',
        date: '',
        dateCondition: 'equal'
    });

    const navigate = useNavigate();

    const getExpenses = async () => {
        const response = await api.get('/expenses', { params: { ...filter, page, limit, sortField, sortOrder } });
        console.log(response.data);
        setExpenses(response.data.expenses);
        setTotal(response.data.total);
    };

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/');
            return;
        }

        getExpenses();
    }, [navigate, page, limit, sortField, sortOrder]);

    const handleLogOut = async (event) => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const cancelDelete = () => {
        setShowModal(false);
    };

    const deleteExpense = async () => {
        await api.delete('/expenses/' + deleteExpenseId);
        setShowModal(false);
        getExpenses();
        alert('Expense Deleted');
    };

    const confirmDelete = (expenseId) => {
        console.log(expenseId);

        setShowModal(true);
        setDeleteExpenseId(expenseId);
    };

    const handleEdit = (expenseId) => {
        navigate('/expense/edit/' + expenseId);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter({ ...filter, [name]: value });
        console.log(filter);
    };

    const handleSortChange = (field) => {
        const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);
    };

    const applyFilter = async () => {
        setPage(1);
        const response = await api.get('/expenses', { params: filter });
        setExpenses(response.data.expenses);
        setTotal(response.data.total); // Ensure the total count is updated
        setShowFilterModal(false);
    };

    const handlePageChange = (newPage) => {
        console.log(newPage);
        setPage(newPage);
        getExpenses();
    };

    return (
        <div>
            <Sidebar />
            <h1>Expenses</h1>

            <div className='buttons' style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', marginRight: '20px' }}>
                <Link to='/expense/add'>
                    <button className='btn btn-primary' style={{ marginRight: '10px' }}>
                    <MdOutlineAddBox className="icon-large" />

                    </button>
                </Link>
                <button onClick={() => setShowFilterModal(true)} className='btn btn-secondary'>
                <FaFilter className="icon-large" />
                </button>

                <button onClick={handleLogOut} className='btn btn-primary'>
                <GrLogout className="icon-large" />
                </button>
            </div>

            <table className='table'>
                <thead>
                    <tr>
                        <th onClick={() => handleSortChange('category')}>
                            Category {sortField === 'category' ?
                                (sortOrder === 'asc' ? '↑' : '↓') : ''}
                        </th>
                        <th onClick={() => handleSortChange('amount')}>
                            Amount {sortField === 'amount' ?
                                (sortOrder === 'asc' ? '↑' : '↓') : ''}
                        </th>
                        <th onClick={() => handleSortChange('paid')}>
                            Paid {sortField === 'paid' ?
                                (sortOrder === 'asc' ? '↑' : '↓') : ''}
                        </th>
                        <th onClick={() => handleSortChange('date')}>
                            Date {sortField === 'date' ?
                                (sortOrder === 'asc' ? '↑' : '↓') : ''}
                        </th>
                        <th>
                            Description
                        </th>
                        <th>
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {expenses.map(expense => (
                        <tr key={expense._id}>
                            <td>
                                {expense.category}
                            </td>
                            <td>
                                {expense.amount}
                            </td>
                            <td>
                                <input type="checkbox" checked={expense.paid} disabled='disabled' />
                            </td>
                            <td>
                                {new Date(expense.date).toLocaleDateString()}
                            </td>
                            <td>
                                {expense.description}
                            </td>
                            <td>
                                <button onClick={() => handleEdit(expense._id)} className="btn btn-primary mr-2">
                                <FaEdit className="icon-large" />
                                </button>

                                <button onClick={() => confirmDelete(expense._id)} className="btn btn-danger mr-2">
                                <MdDeleteForever className="icon-large" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className='pagination'>
                {Array.from({ length: Math.ceil(total / limit) }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={page === i + 1 ? 'active' : ''}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            {showModal &&
                <div className='confirm-overlay'>
                    <div className='confirm-dialog'>
                        <p>Are you sure you want to delete expense</p>
                        <button onClick={deleteExpense}>Yes</button>
                        <button onClick={cancelDelete}>No</button>
                    </div>
                </div>
            }

            {showFilterModal &&
                <div className='filter-overlay'>
                    <div className='filter-dialog'>
                        <h2>Filter Expenses</h2>
                        <div className='filter-group'>
                            <label>Category:</label>
                            <input
                                type="text"
                                name="name"
                                value={filter.name}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className='filter-group'>
                            <label>Amount:</label>
                            <input
                                type="number"
                                name="amount"
                                value={filter.amount}
                                onChange={handleFilterChange}
                            />
                            <select
                                name="amountCondition"
                                value={filter.amountCondition}
                                onChange={handleFilterChange}
                            >
                                <option value="equal">Equal</option>
                                <option value="bigger">Bigger</option>
                                <option value="smaller">Smaller</option>
                            </select>
                        </div>
                        <div className='filter-group'>
                            <label>Paid:</label>
                            <select
                                name="paid"
                                value={filter.paid}
                                onChange={handleFilterChange}
                            >
                                <option value="">Any</option>
                                <option value="true">True</option>
                                <option value="false">False</option>
                            </select>
                        </div>
                        <div className='filter-group'>
                            <label>Date:</label>
                            <input
                                type="date"
                                name="date"
                                value={filter.date}
                                onChange={handleFilterChange}
                            />
                            <select
                                name="dateCondition"
                                value={filter.dateCondition}
                                onChange={handleFilterChange}
                            >
                                <option value="equal">Equal</option>
                                <option value="bigger">Bigger</option>
                                <option value="smaller">Smaller</option>
                            </select>
                        </div>
                        <div className='filter-buttons'>
                            <button onClick={applyFilter}>Apply Filter</button>
                            <button onClick={() => setShowFilterModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}

export default Dashboard;
