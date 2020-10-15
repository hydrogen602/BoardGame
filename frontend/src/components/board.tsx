import * as React from "react";

interface IProps {
    table: Array<Array<string>>,
    callback: (row: number, col: number) => void
}


export function Board(props: IProps) {
    
    function renderSub(arr: Array<string>, key: number) {
        return (
        <tr key={key}>{
            arr.map((elem, index) => {
                let cls = 'empty'
                if (elem == 'w') {
                    cls += ' white'
                }
                else if (elem == 'b') {
                    cls += ' black'
                }
                return (<td key={index} className={cls} onClick={() => props.callback(index, key)}></td>);
            })
        }</tr>
        )
    }

    return (
        <div className="board center">
        <table>
            <tbody>
                {
                    props.table.map((row, index) => renderSub(row, index) )
                }
            </tbody>
        </table>
        </div>
    )
}
