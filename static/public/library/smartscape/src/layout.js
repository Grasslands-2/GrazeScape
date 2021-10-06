import React, { useState } from 'react';
import { DoorOpen } from 'react-bootstrap-icons';
import Toast from 'react-bootstrap/Toast';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar'
import Row from 'react-bootstrap/Row'
import Image from 'react-bootstrap/Image'
import Col from 'react-bootstrap/Col'
import Ratio from 'react-bootstrap/Ratio'
import Alert from 'react-bootstrap/Alert'
import './App.css';
import CSRFToken from './csrf';
import OLMapFragment from './map.js';

// get parameters from python and get form working
//option1
//  user is not logged in; show login page
//option2
// user is logged in show app selection
//option3
// user wants to register
const App = (props) => (
  <div id='main'>
    <Navbar bg="light" variant="light">
    <Container>
      <Navbar.Brand href="#home">
        <img
          alt=""
          src= {static_global_folder}
          width="50%"
          className="d-inline-block align-top"
        />
      </Navbar.Brand>
      <Nav className="justify-content-center ">
          <Nav.Link href="https://grasslandag.org/" target="_blank">Grassland 2.0</Nav.Link>
          <Nav.Link href="https://github.com/Grasslands-2" target="_blank">Source Code</Nav.Link>
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

    <div>
    <Row xs= '7'>
      <Col xs='3' >User pannel
        <Button variant="primary">Primary</Button>{' '}



      </Col>
      <Col xs='9' >
    <OLMapFragment/>
    </Col>
    </Row>
    </div>

</div>
);

export default App;
