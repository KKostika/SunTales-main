import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

function Contact() {
    return(
        <section id='contact' className='block contact-block'>
            <Container fluid>
                <div className='title-holder'>
                    <h2>Contact us</h2>
                    <div className='subtitle'>get connected with us</div>
                </div>
                <Form className='contact-form'>
                    <Row>
                        <Col sm={4}>
                        <Form.Control type='text' placeholder="Full name." required />
                        </Col>
                        <Col>
                        <Form.Control type='email' placeholder="Email address." required />
                        </Col>
                         <Col>
                        <Form.Control type='tel' placeholder="Contact number." required />
                        </Col>
                    </Row>
                    <Row>
                         <Col sm={12}>
                            <Form.Control as="textarea" placeholder="Enter you message" />
                        </Col>
                    </Row>
                    <div className='btn-holder'>
                        <Button type='submit'>Submit</Button>
                    </div>
                </Form>
            </Container>
            
            <div className='google-map'>
                <iframe title='map' src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d50310.605389697244!2d23.69705396772862!3d37.99082998428318!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a1bd1f067043f1%3A0x2736354576668ddd!2zzpHOuM6uzr3OsQ!5e0!3m2!1sel!2sgr!4v1755425668598!5m2!1sel!2sgr" allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
            </div>
            <Container fluid>
                <div className='contact-info'>
                    <ul>
                        <li>
                            <i class="fas fa-envelope"></i>
                            hello@domain.com
                        </li>
                        <li>
                            <i class="fas fa-phone"></i>
                            +306912345678
                        </li>
                        <li>
                            <i class="fas fa-map-marker-alt"></i>
                            Athens, Greece
                        </li>
                    </ul>
                </div>
            </Container>
        </section>
    )
}
export default Contact;