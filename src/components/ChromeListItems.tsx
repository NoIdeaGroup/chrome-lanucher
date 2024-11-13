import { HistoryEntry, Tab } from "../interfaces";
import { ReactElement } from "react";
import { getFavicon } from "@raycast/utils";
import { List } from "@raycast/api";
import { ChromeActions } from ".";
import { text } from "stream/consumers";

export class ChromeListItems {
  public static TabList = TabListItem;
  public static TabHistory = HistoryItem;
  public static Bookmark = BookmarkItem;
}

function truncateString(str:string , maxLength:number): string {
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + '...';
  }
  return str;
}

function HistoryItem({ profile, entry: { url, title, id } }: { entry: HistoryEntry; profile: string }): ReactElement {
  return (
    <List.Item
      id={`${profile}-${id}`}
      title={truncateString(title, 40)}
      subtitle={truncateString(url, 40)}
      icon={getFavicon(url)}
      actions={<ChromeActions.TabHistory title={title} url={url} profile={profile} />}
      accessories={[{ text: `🛜History` }]}
    />
  );
}

function BookmarkItem({ profile, entry: { url, title, id } }: { entry: HistoryEntry; profile: string }): ReactElement {
  return (
    <List.Item
      id={`${profile}-${id}`}
      title={truncateString(title, 40)}
      subtitle={truncateString(url, 40)}
      icon={getFavicon(url)}
      actions={<ChromeActions.TabHistory title={title} url={url} profile={profile} />}
      accessories={[{ text: `⭐️Bookmark` }]}
    />
  );
}

function TabListItem(props: { tab: Tab; useOriginalFavicon: boolean; onTabClosed?: () => void }) {
  return (
    <List.Item
      title={truncateString(props.tab.title, 40)}
      subtitle={truncateString(props.tab.urlWithoutScheme(),40)}
      keywords={[props.tab.urlWithoutScheme()]}
      actions={<ChromeActions.TabList tab={props.tab} onTabClosed={props.onTabClosed} />}
      icon={props.useOriginalFavicon ? props.tab.favicon : props.tab.googleFavicon()}
      accessories={[{ text: `🌎Tab` }]}
    />
  );
}
