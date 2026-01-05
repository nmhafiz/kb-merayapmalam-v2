import FeedList from '../components/feed/FeedList';
import CreatePostForm from '../components/feed/CreatePostForm';
import PollCard from '../components/polls/PollCard';

export default function FeedPage() {
    return (
        <div className="pb-24 pt-6 px-4 max-w-md mx-auto min-h-screen">
            <h1 className="text-2xl font-bold text-text-primary mb-6">Community Feed</h1>

            <div className="mb-6">
                <PollCard />
            </div>

            <CreatePostForm />
            <FeedList />
        </div>
    );
}
