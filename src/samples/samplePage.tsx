import React, { useState } from 'react'
import { SafeSpacesIframe } from '../components/safespaces/SafeSpacesIframe'

const SafeSpaces = () => {
    const containerName = 'safee-spaces-container';
    const [visible, setVisible] = useState(false);

    const showPopup = () => {
       setVisible(true);
    }

    const itsClosing = () => {        
        setVisible(false);
    }
    
    return <>
        <button onClick={showPopup}>{visible}</button>
        <div id={containerName}>
            <SafeSpacesIframe containerName={containerName} onClosed={itsClosing} visible={visible}/>
        </div>
    </>
}

export default SafeSpaces