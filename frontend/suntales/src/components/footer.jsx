import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';

function Footer() {
    const [topBtn, setTopBtn] = useState(false);

    useEffect(() => {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400 ) {
                setTopBtn(true);
            } else {
                setTopBtn(false);
            }
        })

    }, [])

    function goTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }
 
    return(

            <Container fluid className='footer'>
                <div className="copyright">&copy; 2025 Corporate. All rights Reserved</div>
                <div className='socials'>
                        <ul>
                            <li>
                                <i className="fas fa-envelope"></i>
                                hello@domain.com
                            </li> <br />
                            <li>
                                <i className="fas fa-phone"></i>
                                +306912345678
                            </li>
                            <li>
                                <i className="fas fa-map-marker-alt"></i>
                                Athens, Greece
                            </li>
                        </ul>
                </div>
                {
                    topBtn && (<div className='go-top' onClick={goTop}></div>)
                }
            </Container>
        
    )

}
export default Footer;