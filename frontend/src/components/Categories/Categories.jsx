import './Categories.css'


const CATEGORIES = [
    {
        id: 1,
        name: "Hotels",
        icon: "🏨",
        count: 120,
    },
    {
        id: 2,
        name: "Hostels",
        icon: "🏠",
        count: 85,
    },
    {
        id: 3,
        name: "Apartments",
        icon: "🏢",
        count: 64,
    },
    {
        id: 4,
        name: "Bed & Breakfast",
        icon: "🛏️",
        count: 43,
    },
]

// Componente CategoryCard que representa cada tarjeta de categoría
const CategoryCard = ({ name, icon, count }) => {
    return (
        <div className="category-card">
            <span className="category-card__icon">{icon}</span>
            <h3 className="category-card__name">{name}</h3>
            <p className="category-card__count">{count} Units</p>
        </div>
    )
}


// Componente principal
const Categories = () => {
    return (
        <section className="categories">
            <div className="categories__content">

                <div className="categories__header">
                    <h2 className="categories__title">
                        Search by type of housing
                    </h2>
                    <p className="categories__subtitle">
                        Perfect match for your next trip
                    </p>
                </div>

                {/* recorre el array de categorías con map usando el ID (necesario para que React lo identifique) */}
                <div className="categories__grid">
                    {CATEGORIES.map(category => (
                        <CategoryCard
                            key={category.id}
                            name={category.name}
                            icon={category.icon}
                            count={category.count}
                        />
                    ))}
                </div>

            </div>
        </section>
    )
}

export default Categories