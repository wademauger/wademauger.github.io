export default function Table({ titles, elements }) {
    return (<table class="table-auto ingredient-table"> 
        <thead>
            <tr>
                {titles.map((title: any) => <th>{title}</th>)}
            </tr>
        </thead>
        <tbody>
            {elements.map((row: any) => {
                return <tr>{Object.values(row).map((cell: any) => <td>{cell}</td>)}</tr>;
            })}
        </tbody>
    </table>);
}