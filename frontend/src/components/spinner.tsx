import * as React from "react";

interface IProps {
    shown: boolean
}


export function Spinner(props: IProps) {
    if (props.shown) {
        return <div className={'loader'}></div>;
    }
    else {
        return <div className={'loader'} style={{opacity: 0}}></div>;
    }
}
