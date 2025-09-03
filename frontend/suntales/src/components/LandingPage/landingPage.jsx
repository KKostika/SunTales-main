import { useNavigate } from 'react-router-dom';
import Carousel from 'react-bootstrap/Carousel';
import duckInClass from '../../assets/images/ducksinClass.jpg';
import Adventure from '../../assets/images/Adventures.jpg';
import Contact from '../../assets/images/contactInfo.jpg';
import Heroes from '../../assets/images/ourHeroes.jpg';



var heroData = [
    {
    id: 1,
    title: "Where little stories bloom",
    description: "Discover our vision and the caring space where every child’s story begins.",
    image: duckInClass,
    link:"#about"
},
{
    id: 2,
    title: "Tiny Feet, Big Adventures",
    description: "Discover upcoming events, joyful excursions, and daily classroom moments.",
    image: Adventure,
    link:"#activities"
},
{
    id: 3,
    title: "Your Line to Little Wonders",
    description: "Contact us to discover how we can support your child’s journey with answers, smiles, and playful professionalism.",
    image: Contact,
    link:'#contact'
},
{
    id: 4,
    title: "Our Heroes",
    description: "Meet the everyday heroes who guide, inspire, and celebrate every little victory in our kindergarten world",
    image: Heroes,
    link:"#teachers"
}
]

function Landing() {
    const navigate = useNavigate();

      const handleClick = (link) => {
    if (link.startsWith("#")) {
      const target = document.querySelector(link);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(link);
    }
  };

    return( 
        <section id="home" className='hero-block'>
            <Carousel>
                {
                    heroData.map(hero => {
                        return(
                            <Carousel.Item key ={hero.id}>
                                <img 
                                className = "d-block w-100" 
                                alt={"Slide " + hero.id} 
                                src={hero.image}/>
                                <Carousel.Caption>
                                <h3>{hero.title}</h3>
                                <p>{hero.description}</p>
                                 <button
                                className='btn btn-primary mt-3'
                                onClick={() => handleClick(hero.link)}
                                        >
                                Learn More
                                </button>
                                </Carousel.Caption>
                            </Carousel.Item>

                        )
                    })
                }
                
            </Carousel>
        </section>
    );
} 
export default Landing;