import * as React from "react";

interface IProps {
    msg: string,
    callBack: () => void
}


export function Popup(props: IProps) {
    return (
        <div className="popup center window">
            <p>{props.msg}</p>
            <button className="button" onClick={props.callBack}>OK</button>
        </div>
    );
}
