import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';

import img from '../../assets/images/activities2.jpg';


function Activities() {
    return (
        <section id="activities" className='block about-block'>
            <Container fluid>
                <div className='title-holder'>
                    <h2>Activities</h2>
                    <div className='subtitle'>learn more about our activities</div>
                </div>
                <Row>
                    <Col sm={6}>
                        <p>At Suntale Kindergarten, we believe that every child grows best through joyful movement and meaningful experiences.
                            Our daily schedule is filled with activities designed to support both physical and cognitive development — from music and dance to storytelling, gardening, and sensory play.
                            Whether children are building with blocks, painting with their fingers, or exploring nature trails, each moment is an opportunity to strengthen motor skills, spark imagination, and build emotional resilience.</p><br />
                        <p>We carefully craft our programs to nurture curiosity, cooperation, and confidence.
                            Through yoga for kids, role-playing games, and collaborative art projects, children learn to express themselves, connect with others, and discover their unique strengths.
                            At Suntale, we don’t just offer activities — we offer experiences that help children grow into their happiest, healthiest selves.</p><br />
                        <h5>Suntales<br />Tiny feet, big adventures</h5>
                    </Col>
                    <Col sm={6}>
                        <Image src={img} />
                    </Col>
                </Row>
            </Container>
        </section>
    );
}
export default Activities;