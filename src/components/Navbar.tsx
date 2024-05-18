import React, { useState } from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import '../Navbar.css'; // Import the CSS for custom styling

const NavbarMenu: React.FC = () => {
    const [expanded, setExpanded] = useState(false);

    return (
        <Navbar expanded={expanded} fixed="top" expand="lg" bg="dark" variant="dark">
            <Container fluid>
                <Navbar.Brand href="/">
                    <img
                        src="/DWARFLAB_LOGO_Green.png" // Replace with your logo path
                        height="40"
                        className="d-inline-block align-top"
                        alt="Logo"
                    />
                </Navbar.Brand>
                <Navbar.Toggle
                    aria-controls="basic-navbar-nav"
                    onClick={() => setExpanded(!expanded)}
                />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ml-auto">
                        {/*<Nav.Link href="/">Home</Nav.Link>
                        <Nav.Link href="/about">About</Nav.Link>
                        <NavDropdown title="Services" id="basic-nav-dropdown">
                            <NavDropdown.Item href="/service1">Service 1</NavDropdown.Item>
                            <NavDropdown.Item href="/service2">Service 2</NavDropdown.Item>
                            <NavDropdown.Item href="/service3">Service 3</NavDropdown.Item>
                        </NavDropdown>
                        <Nav.Link href="/contact">Contact</Nav.Link>*/}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavbarMenu;
