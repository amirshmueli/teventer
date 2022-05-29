import { Connect } from "../pages/connect/login";
import { Signup } from "../pages/connect/signup";
import { HomePage } from "../pages/home/homepage";
import { Provider } from "react-redux";
import { AppStore } from "../../store/store";
import AllAdminsScreen from "../pages/allfeed/alladmins/AdminScreen";
import PageOfEvents from "../pages/events/event_choose/PageOfEvents";
import Navbar from "../navbar/navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EventCreate from "../pages/events/event_create/EventCreate";
import FeedPage from "../pages/events/event_feed/feedpage/FeedPage";
import { TicketPage } from "../pages/events/event_feed/tickets/ticketPage";
import UsersPage from "../pages/events/event_feed/users/usersPage";
import TicketCreate from "../pages/events/event_feed/tickets/createTicket/createTicket";
import AdminCreate from "../pages/events/event_feed/users/createUser/createAdmin";

function WebRouter() {
  return (
    <Router>
      <Provider store={AppStore}>
        <div className="Main">
          <Navbar />
          <div className="App">
            <Routes>
              <Route path="/connect" element={<Connect />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/events" element={<PageOfEvents />} />
              <Route path="/create-event" element={<EventCreate />} />
              <Route path="/event-feed" element={<FeedPage />} />
              <Route path="/create-ticket" element={<TicketCreate />} />
              <Route path="/create-admin" element={<AdminCreate />} />
              <Route path="/allfeed" element={<AllAdminsScreen />} />
              <Route path="*" element={<div>404 not found</div>} />
            </Routes>
          </div>
        </div>
      </Provider>
    </Router>
  );
}

export default WebRouter;
