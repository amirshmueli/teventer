import React from 'react'

function PopUp(props) {

    const renderCompopnent = () => {
        return <div className="popup-container">
            <div className='popup-inner'>
                <button onClick={() => props.setVisible(false)}>close</button>
                {props.children }
            </div>

        </div>
    }
  return (
    props.Visible ? renderCompopnent() : ""
  )
}

export default PopUp