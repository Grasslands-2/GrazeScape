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
import Header from './header.js';

// get parameters from python and get form working
//option1
//  user is not logged in; show login page
//option2
// user is logged in show app selection
//option3
// user wants to register

const App = (props) => (
  <div id='main'>
    <Header user = {"matthew"}/>

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
