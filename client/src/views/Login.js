import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    FormGroup,
    Form,
    Input,
    InputGroupAddon,
    InputGroupText,
    InputGroup,
    Row,
    Col,
} from "reactstrap";

const Login = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkLogin = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                navigate('/dashboard');
            }
        }
        checkLogin();
    }, [navigate]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleEmailChange = (event) => setEmail(event.target.value);
    const handlePasswordChange = (event) => setPassword(event.target.value);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post("http://localhost:5001/api/login", {
                email,
                password,
            });
            localStorage.setItem('token', response.data);
            navigate('/dashboard');
        } catch (error) {
            console.error("Login error", error.response.data);
        }
    }

    return (
        <>
            <div className="d-flex align-items-center justify-content-center vh-100">
                <Row className="justify-content-center align-items-center w-100">
                    <Col lg="5" md="7">
                        <Card className="bg-secondary shadow border-0">
                            <CardHeader className="bg-transparent pb-5">
                                <div className="text-muted text-center mt-2 mb-3">
                                    <small>Sign in with</small>
                                </div>
                                <div className="btn-wrapper text-center">
                                    <Button
                                        className="btn-neutral btn-icon"
                                        color="default"
                                        href="#pablo"
                                        onClick={(e) => e.preventDefault()}
                                    >
                                        <span className="btn-inner--icon">
                                            <img
                                                alt="..."
                                                src={require("../assets/img/icons/common/github.svg").default}
                                            />
                                        </span>
                                        <span className="btn-inner--text">Github</span>
                                    </Button>
                                    <Button
                                        className="btn-neutral btn-icon"
                                        color="default"
                                        href="#pablo"
                                        onClick={(e) => e.preventDefault()}
                                    >
                                        <span className="btn-inner--icon">
                                            <img
                                                alt="..."
                                                src={require("../assets/img/icons/common/google.svg").default}
                                            />
                                        </span>
                                        <span className="btn-inner--text">Google</span>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardBody className="px-lg-5 py-lg-5">
                                <div className="text-center text-muted mb-4">
                                    <small>Or sign in with credentials</small>
                                </div>
                                <Form role="form">
                                    <FormGroup className="mb-3">
                                        <InputGroup className="input-group-alternative">
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <i className="ni ni-email-83" />
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <Input
                                                placeholder="Email"
                                                type="email"
                                                autoComplete="new-email"
                                                value={email}
                                                onChange={handleEmailChange}
                                            />
                                        </InputGroup>
                                    </FormGroup>
                                    <FormGroup>
                                        <InputGroup className="input-group-alternative">
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <i className="ni ni-lock-circle-open" />
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <Input
                                                placeholder="Password"
                                                type="password"
                                                autoComplete="new-password"
                                                value={password}
                                                onChange={handlePasswordChange}
                                            />
                                        </InputGroup>
                                    </FormGroup>
                                    <div className="custom-control custom-control-alternative custom-checkbox">
                                        <input
                                            className="custom-control-input"
                                            id="customCheckLogin"
                                            type="checkbox"
                                        />
                                        <label
                                            className="custom-control-label"
                                            htmlFor="customCheckLogin"
                                        >
                                            <span className="text-muted">Remember me</span>
                                        </label>
                                    </div>
                                    <div className="text-center">
                                        <Button className="my-4" color="primary" type="submit" onClick={handleSubmit}>
                                            Sign in
                                        </Button>
                                    </div>
                                    <Row className="mt-4 text-center">
                            <Col xs="12">
                                <a
                                    className="text-light"
                                    href="#pablo"
                                    onClick={(e) => e.preventDefault()}
                                >
                                    <small>Forgot password?</small>
                                </a>
                            </Col>
                        </Row>
                        <Row className="mt-2 text-center">
                            <Col xs="12">
                                <Link to='/Register'>
                                    <small>Create an account</small>
                                </Link>
                            </Col>
                        </Row>
                                </Form>
                            </CardBody>
                      
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default Login;
