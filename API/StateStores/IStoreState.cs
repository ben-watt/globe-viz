using System.Threading.Tasks;

namespace shipments_viz.StateStores
{
    public interface IStoreState<T>
    {
        Task Save(T entity);
    }
}