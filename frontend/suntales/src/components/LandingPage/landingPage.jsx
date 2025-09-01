import { useNavigate } from 'react-router-dom';
import Carousel from 'react-bootstrap/Carousel';
import duckInClass from '../../assets/images/ducksinClass.jpg';
import Adventure from '../../assets/images/Adventures.jpg';
import Yummy from '../../assets/images/Yummy.jpg';
import financial from '../../assets/images/financial.jpg';



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
    link:"/activites"
},
{
    id: 3,
    title: "Quack & Snack",
    description: "Explore this week’s nutritious menu and stay informed on your child’s daily eating",
    image: Yummy,
    link:'#meals'
},
// {
//     id: 4,
//     title: "Financial Overview",
//     description: "Clear insights into tuition schedules, upcoming payments, and essential budget allocations for your child’s learning journey",
//     image: financial,
//     link:"/financial"
// }
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