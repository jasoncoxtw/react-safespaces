import React, { CSSProperties, useEffect, useRef, useState } from 'react'

type SafeSpaceIframeProps = {
    containerName: string;
    onClosed: () => void;
    visible: boolean;
}

export const SafeSpacesIframe = (props: SafeSpaceIframeProps) => {
    
    const iframeElement = useRef<HTMLIFrameElement>(null);
    const iframeId = 'safe-space-iframe';
    const [formHtml, setFormHtml] = useState<string>();
    const [safeSpaceAvailable, setSafeSpaceAvailable] = useState<boolean>();
    
    useEffect(() => {
        if(!iframeElement || !iframeElement.current || !formHtml) {
            return;
        }
        const doc = iframeElement.current.contentDocument;

        doc?.open();
        doc?.write(formHtml);
        doc?.close();
    }, [formHtml])
    
    useEffect(() => {
        window.addEventListener("keyup", handleKeyPress);

        const root = document.getElementById(props.containerName) as Element;
        const observer = new MutationObserver(mutationRecords => {
            mutationRecords.forEach(mutation => {
                mutation.removedNodes.forEach(removed => {

                    if (removed.nodeType === Node.ELEMENT_NODE) {
                        const elm = (removed as unknown) as HTMLElement;
                        if (elm && elm.id === iframeId) {
                            resetPopup();
                        }
                    }

                    return;
                });
            });
        });

        if (root){
            observer.observe(root as Node, {
                childList: true, // observe direct children
                subtree: true, // and lower descendants too
                characterDataOldValue: false, // pass old data to callback
            });
        }

        return () => {
            if (observer){
                observer.disconnect();
            }

            window.removeEventListener("keyup", handleKeyPress);
        }
    })
    useEffect(() => {
        if (!props.visible) {
            return;
        }

        const isAvailable = async () => {
            const result = await window.fetch('https://apps.parcelforce.com/sso/Home/IsAlive')            
            if (result?.status === 200){
                const data = await result.json();
                if (data?.isAlive) {
                    document.body.style.overflow = 'hidden';
                    setSafeSpaceAvailable(true);
                }
                else {
                    setSafeSpaceAvailable(false);
                }
                
            }
        
            setSafeSpaceAvailable(false);
        }

        isAvailable();
    }, [props.visible]);
    
    useEffect(() => {
        if (!safeSpaceAvailable) {
            return;
        }

        const fetchData = async () => {
            if (!window) {
                return;
            }

            const htmlResponse = await window.fetch("https://apps.parcelforce.com/sso/");
            if (htmlResponse?.status === 200){
                const html = await htmlResponse.text();
                setFormHtml(html);
            }
        }

        fetchData();
    }, [safeSpaceAvailable])

    const resetPopup = () => {
        setFormHtml(undefined);        
        document.body.style.removeProperty('overflow');
        window.scrollTo(0, 0);
        props.onClosed();
    }

    const handleKeyPress = (ev:KeyboardEvent) => {
        ev.stopPropagation();
        if (ev.keyCode === 27){
            resetPopup();
        }
    }
    
    const style: CSSProperties = {
        height: '100%',        
        width:'100%',   
        top:"0",
        bottom:"0",    
        zIndex:700,
        position: 'fixed',
        backgroundColor: "rgba(0, 0, 0, 0.26)"
    }

    if (!props.visible){
        return null;
    }

    return <div id='safe-space-iframe-container'>
            <iframe title='Safe spaces' 
                id={iframeId} 
                style={style}
                src='about:blank' 
                scrolling='no' 
                frameBorder='0' 
                ref={iframeElement}/>
        </div>
}
