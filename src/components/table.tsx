export default function Table({ titles, elements }: { titles: string[], elements: any[] }) {
    return (<table className="table-auto ingredient-table"> 
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