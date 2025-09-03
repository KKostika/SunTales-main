import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Miss_E from '../../assets/images/teachers/Miss_E.jpg';
import Miss_N from '../../assets/images/teachers/Miss_N.jpg';
import Miss_V from  '../../assets/images/teachers/Miss_V.jpg';
import Mr_A from '../../assets/images/teachers/Mr_A.jpg';
import Mr_F from '../../assets/images/teachers/Mr_F.jpg';
import Mr_G from '../../assets/images/teachers/Mr_G.jpg';
import Image from 'react-bootstrap/Image';


const teacherData = [
    {
        id:1,
        image: Miss_E,
        name: "Miss E.",
        experience: "10 years",
        description: "Miss E brings wisdom, warmth, and creativity into every classroom moment. Her gentle approach and deep understanding of young minds make her a beloved guide for both children and parents alike."
    },

    {
        id:2,
        image: Mr_A,
        name: "Mr A.",
        experience: "12 years",
        description: "Mr. A brings structure, warmth, and a spark of curiosity to every classroom. Known for his calm presence and creative teaching style, he helps little learners grow with confidence and joy — one discovery at a time."
    },

    {
        id:3,
        image: Miss_N,
        name: "Miss N.",
        experience: "7 years",
        description: "Miss N brings energy, empathy, and creativity to every classroom. Her playful spirit and thoughtful approach inspire children to explore, express themselves, and grow with confidence through imagination and joyful learning."
    },

    {
        id:4,
        image: Mr_F,
        name: "Mr F.",
        experience: "10 years",
        description: "Mr. F combines patience, structure, and a deep understanding of young minds. His calm demeanor and thoughtful teaching style create a safe and engaging environment where children feel supported, curious, and ready to grow. He’s the kind of educator who turns everyday moments into meaningful learning experiences."
    },

    {
        id:5,
        image: Miss_V,
        name: "Miss V.",
        experience: "14 years",
        description: "Miss V brings calm, creativity, and deep care to her classroom. She fosters a warm space where children feel safe to explore, express, and grow every day."
    },

    {
        id:6,
        image: Mr_G,
        name: "Mr G.",
        experience: "11 years",
        description: "Mr. G Mr. G brings a calm presence and a thoughtful approach to early childhood education. His ability to connect with each child and guide them with patience and care makes his classroom a place of trust, growth, and joyful learning."
    },
]

function Teachers() {
    return(
        <section id='teachers' className='block teams-block'> 
             <Container fluid>
                <div className='title-holder'>
                    <h2>Our Teachers</h2>
                    <div className='subtitle'>inspiring every tiny step</div>
                </div>
                <Row>
                    {
                      teacherData.map(teachers => {
                        return (
                            <Col sm={4} key={teachers.id}>
                                <div className='image'>
                                    <Image src={teachers.image} />
                                </div>
                                <div className='content'>
                                    <h3>{teachers.name}</h3>
                                    <span className='designation'>{teachers.experience}</span>
                                    <p>{teachers.description}</p>

                                </div>
                            </Col>

                        )
                      })
                    }
                    
                </Row>
            </Container>
        </section>
    )
}
export default Teachers;