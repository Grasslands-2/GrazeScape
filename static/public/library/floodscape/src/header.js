import React from 'react'
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar'
import Image from 'react-bootstrap/Image'
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import CSRFToken from './csrf';
import { DoorOpen } from 'react-bootstrap-icons';


class Header extends React.Component{
    constructor(props){
        super(props)
        this.user = props.text
    }

    render(){
        return(
        <Navbar bg="light" variant="light">
            <Container>
                <Navbar.Brand href="#home">
                <img
                  alt=""
                  src= {static_logo}
                  width="50%"
                  className="d-inline-block align-top"
                />
                </Navbar.Brand>
                <Nav className="justify-content-center ">
                  <Nav.Link href="/">Main Menu</Nav.Link>
                  <Nav.Link href="https://github.com/Grasslands-2" target="_blank">Source Code</Nav.Link>
                </Nav>
                <Nav>
                    <Navbar.Text>
                        Signed in as:  <u>{user_info.user_name}</u>
                    </Navbar.Text>

               </Nav>
                <Nav>
                   </Nav>
                   <Nav className="justify-content-right ">
                   <Form method="POST" className="d-flex">
                   <CSRFToken />
                    <input type="hidden" name="logout" value="True" />
                    <Button type="submit" variant="outline-success"><DoorOpen/> Logout</Button>
                    </Form>
                </Nav>
            </Container>
        </Navbar>
        )
    }
}
export default Header