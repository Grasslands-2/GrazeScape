import React from 'react';
import { DoorOpen } from 'react-bootstrap-icons';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar'
import Row from 'react-bootstrap/Row'
import Image from 'react-bootstrap/Image'
import Col from 'react-bootstrap/Col'
import Alert from 'react-bootstrap/Alert'
import './App.css';
import CSRFToken from './csrf';
var error_message = '';
var homeState = {
    'showSign': true,
    'showReg': false,
    'showApps': false,
    'showError': false
};
/**
 * Set state of the homepage depending on if user is logged in, not logged in, or is registering
 * @param  {[type]} arg1 [description]
 * @param  {[type]} arg2 [description]
 * @return {[type]}      [description]
 */
function manageSignIn() {
    // user info comes from the Django controller, which manages the sign in
    if (user_info.is_logged_in == "True") {
        homeState.showSign = false
        homeState.showReg = false
        homeState.showApps = true
    }
    else if (user_info.show_register == "True") {
        homeState.showSign = false
        homeState.showReg = true
        homeState.showApps = false
    }
    if (user_info.error != "") {
        homeState.showError = true
        error_message = user_info.error
    }
}

// get parameters from python and get form working
//option1
//  user is not logged in; show login page
//option2
// user is logged in show app selection
//option3
// user wants to register
manageSignIn();

const App = (props) => (
    <div id='main'>
        <Navbar bg="light" variant="light">
            <Container>
                <Navbar.Brand className="justify-content-left " href="https://grasslandag.org/" target="_blank">
                    <img
                        alt=""
                        src="static/public/library/images/color-flush-Grassland2.0-logo-web.svg"
                        width="50%"
                        className="d-inline-block align-top"
                    />{' '}
                </Navbar.Brand>
                <Nav className="justify-content-center ">
                    <Nav.Link href="https://github.com/Grasslands-2" target="_blank">Source Code</Nav.Link>
                </Nav>
                <Nav>
                    <Navbar.Text>
                        Signed in as:  <u>{user_info.user_name}</u>
                    </Navbar.Text>

                </Nav>
                <Nav className="justify-content-end ">
                    <Form method="POST" className="d-flex">
                        <CSRFToken />
                        <input type="hidden" name="logout" value="True" />
                        <Button type="submit" variant="outline-success"><DoorOpen /> Logout</Button>
                    </Form>

                </Nav>

            </Container>
        </Navbar>

        <div className='main_container'>
            <div className='header1'>
                <h1 className="header pt-2 h4">Welcome To The Grassland 2.0 App Portal</h1>
            </div>
            <Alert key='danger' variant='danger' className={homeState.showError ? "" : "d-none"}>
                {error_message}
            </Alert>
            <CSRFToken />
            <Row xs='7'>
                <Col xs='1' ></Col>
                <Col xs='5' >
                    <Container id='sign_in_form' className={'form ' + (homeState.showSign ? "" : "d-none")}>
                        <h6 className="header  text-left">Please Sign In</h6>
                        <Form method="POST" id="sign_in_form">
                            <CSRFToken />
                            <input type="hidden" name="new_user" value="False" />
                            <input type="hidden" id="g-recaptcha-response_signin" name="g-recaptcha-response" />
                            <Form.Group className=" " controlId="formBasicUserName">
                                <Form.Label>User Name</Form.Label>
                                <Form.Control name='username' type="text" placeholder="Enter username" />
                                <Form.Text className="text-muted">
                                    We'll never share your email with anyone else.
                                </Form.Text>
                            </Form.Group>
                            <Form.Group className="" controlId="formBasicPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control name="password" type="password" placeholder="Password" />
                                <Form.Text className="text-muted">
                                    <a href='/?register=true'>Create new account </a>
                                </Form.Text>
                            </Form.Group>
                            <Button variant="primary" type="Submit">
                                Log In
                            </Button>
                        </Form>
                    </Container>
                    <Container id='register_form' className={'form ' + (homeState.showReg ? "" : "d-none")}>
                        <h6 className="header text-left">Please Register</h6>
                        <Form method="POST" id="sign_in_form">
                            <CSRFToken />
                            <input type="hidden" name="new_user" value="True" />
                            <input type="hidden" id="g-recaptcha-response_register" name="g-recaptcha-response" value="hello" />
                            <Form.Group className="" controlId="formBasicEmail">
                                <Form.Label>User Name*</Form.Label>
                                <Form.Control name='username' type="text" placeholder="Enter username" />
                            </Form.Group>
                            <Form.Group className="" controlId="formBasicPassword">
                                <Form.Label>Password*</Form.Label>
                                <Form.Control name='password' type="password" placeholder="Password" />
                            </Form.Group>
                            <Form.Group className="" controlId="formBasicPassword">
                                <Form.Label>Repeat Password*</Form.Label>
                                <Form.Control name='password2' type="password" placeholder="Password" />
                            </Form.Group>
                            <Form.Group className="" controlId="formBasicEmail">
                                <Form.Label>Email</Form.Label>
                                <Form.Control name='email' type="email" placeholder="Enter email" />
                                <Form.Text className="text-muted">
                                    *Required
                                </Form.Text>
                            </Form.Group>
                            <p></p>
                            <Button variant="primary" type="submit">
                                Register
                            </Button>
                        </Form>
                    </Container>
                </Col>
            </Row>

            {/*/Container for app links*/}
            <Container className={(homeState.showApps ? "" : "d-none")}>
                <Row>
                    <Col xs='3'>
                    </Col>
                    <Col xs='6' className="appRegion">
                        <h2 className="header h5">Please select an app to begin</h2>
                        <Row className="appSelect">
                            <a href="/grazescape"><Image className="shadow-lg app_click image" fluid src="static/public/library/images/graze-logo.png" rounded /></a>
                        </Row>
                        <Row className="appInfo">
                            <Col><a href="https://docs.google.com/document/d/147LGZV9sGDFgub-B_s6EUCtVAF_oDruvF08ZiEiZyCQ" target="_blank">User Manual</a></Col>
                            <Col><a href="https://www.youtube.com/watch?v=3g7c-tB19EU" target="_blank">Video Tutorial</a></Col>
                            <Col><a href="https://forms.gle/4jy4acwjTe2mzJLw7" target="_blank">Feedback Form</a></Col>
                        </Row>
                        <Row > </Row>
                        <Row className="appSelect">
                            <a href="/smartscape"><Image className="shadow-lg app_click image" fluid src="static/public/library/images/dss_logo.png" rounded /></a>
                        </Row>
                        <Row className="appInfo">
                            <Col><a >User Manual</a></Col>
                            <Col><a >Video Tutorial</a></Col>
                            <Col><a>Feedback Form</a></Col>
                            {/*
                    <Col><a href="https://docs.google.com/document/d/147LGZV9sGDFgub-B_s6EUCtVAF_oDruvF08ZiEiZyCQ"target="_blank">User Manual</a></Col>
                    <Col><a href="https://www.youtube.com/watch?v=3g7c-tB19EU" target="_blank">Video Tutorial</a></Col>
                    <Col><a href="https://forms.gle/4jy4acwjTe2mzJLw7" target="_blank">Feedback Form</a></Col>
                    */}
                        </Row>
                    </Col>
                    <Col xs='3'>
                    </Col>
                </Row>
            </Container>
        </div>

        <footer id='footer'>
            <Container>
                Grassland 2.0 is a collaborative group of farmers, researchers, and public and private sector leaders working to develop pathways for increased farmer profitability, yield stability and nutrient and water efficiency, while improving water quality, soil health, biodiversity, and climate resilience through grassland-based agriculture.
                <p></p>
                The University of Wisconsin - Madison respects your privacy and is committed to protecting your privacy through our compliance with <a href="https://drive.google.com/file/d/151_PhFk5h6KrbVz92XHjwPFqXrrv89AY/view" target="_blank">this website privacy policy.</a>
                <br></br>
                By using this website and the associated apps, you agree to this privacy policy.
                <p></p>*This project is based at UW–Madison and the work is supported by the Sustainable Agriculture Systems Coordinated Agricultural Program grant no. 2019-68012-29852 from the USDA National Institute of Food and Agriculture.
                <h2 className="h5 mt-3">Accessibility Statement for Grasslands 2.0</h2>
                <p>
                    Despite our best efforts to ensure accessibility of Grasslands 2.0, there may be some limitations. Below is a description of known limitations. Please contact us if you observe an issue not listed below.
                </p>
                <p>
                    Known limitations for Grasslands 2.0:
                </p>
                <ol>
                    <li><strong>Users with visual disabilities</strong>: Visual elements are not described correctly using screen readers.</li>
                    <li><strong>Keyboard navigation</strong>: Some parts of the application may not be navigable using keyboard.</li>
                    <li><strong>Smaller screens</strong>: The application may not display properly on small screens (i.e. tablets and phones).</li>
                    <li><strong>Zooming</strong>: The application may not display properly if zoom level is above 150%.</li>
                </ol>
                <div class="tile-image-container">
                    <img
                        alt=""
                        src="static/public/library/images/Maptiler1.png"
                        width="175px"
                    />
                </div>
            </Container>
        </footer>
    </div>
);

export default App;
