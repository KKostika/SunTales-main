import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';

import img from '../assets/images/img.jpg';


function About(){
    return(
       <section id="about" className='block about-block'>
            <Container fluid>
                <div className ='title-holder'>
                    <h2>About Us</h2>
                    <div className='subtitle'>learn more about us</div>
                </div>
                <Row>
                    <Col sm={6}>
                        <Image src={img}/>
                    </Col>
                     <Col sm={6}>
                        <p> At Suntale Kindergarten, we believe that every child is a bright storyteller of their own journey. 
                            Our name reflects our mission: to nurture young minds in a warm, joyful environment where imagination, discovery, and kindness shine every day. 
                            We offer a safe and inspiring space where children learn through play, creativity, and meaningful connections with others.</p><br />
                        <p>Our child-centered approach blends hands-on activities, outdoor exploration, and emotional growth. 
                            With a team of passionate educators and strong family partnerships, we create a vibrant community where every child feels seen, supported, and celebrated. 
                            At Suntale, we don’t just prepare children for school — we help them fall in love with learning and life.</p><br />
                            <h5>Suntales<br />Where little stories bloom...</h5>
                            
                    </Col>
                </Row>
            </Container>
       </section>
    );
}
export default About;