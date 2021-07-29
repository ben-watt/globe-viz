using System.Threading.Tasks;

namespace globe_viz.StateStores
{
    public interface IStoreState<T>
    {
        Task Save(T entity);
    }
}