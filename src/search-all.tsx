import { getPreferenceValues, List, Icon } from "@raycast/api";
import { useState } from "react";
import { Preferences } from "./interfaces";
import { ChromeActions, ChromeListItems } from "./components";
import { useTabSearch } from "./hooks/useTabSearch";
import { CHROME_PROFILE_KEY, DEFAULT_CHROME_PROFILE_ID } from "./constants";
import { useHistorySearch } from "./hooks/useHistorySearch";
import { useCachedState } from "@raycast/utils";
import { groupEntriesByDate } from "./search-history";
import ChromeProfileDropDown from "./components/ChromeProfileDropdown";
import { useBookmarkSearch } from "./hooks/useBookmarkSearch";

export default function Command() {
  const { useOriginalFavicon } = getPreferenceValues<Preferences>();
  const [searchText, setSearchText] = useState("");
  const [profile] = useCachedState<string>(CHROME_PROFILE_KEY, DEFAULT_CHROME_PROFILE_ID);

  const { data: tabData, isLoading: isLoadingTab } = useTabSearch(searchText);

  const {
    data: historyData = [],
    isLoading: isLoadingHistory,
    revalidate: revalidateHistory,
  } = useHistorySearch(profile, searchText);

  const {
    data: bookmarkData,
    isLoading: isLoadingBookmark,
    revalidate: revalidateBookmark,
  } = useBookmarkSearch(searchText);

  const revalidate = (profile: string) => {
    revalidateHistory?.(profile);
    revalidateBookmark(profile);
  };

  return (
    <List
      // loading appears not to matter, but leaving it case it handles a case that I'm unaware of
      isLoading={isLoadingTab || isLoadingHistory || isLoadingBookmark}
      onSearchTextChange={setSearchText}
      throttle={true}
      searchBarAccessory={<ChromeProfileDropDown onProfileSelected={revalidate} />}
    >
      <List.Section key={"new-tab"} title={"New Tab"}>
        <List.Item
          title={!searchText ? "Open Empty Tab" : `Search "${searchText}"`}
          icon={{ source: !searchText ? Icon.Plus : Icon.MagnifyingGlass }}
          actions={<ChromeActions.NewTab query={searchText} />}
        />
        {
          tabData.map((tab) => (
            <ChromeListItems.TabList key={tab.key()} tab={tab} useOriginalFavicon={useOriginalFavicon} />
          ))
        }
        {
          historyData.map((e) => (
            <ChromeListItems.TabHistory key={e.id} entry={e} profile={profile} />
          ))
        }
        {bookmarkData?.map((e) => (
          <ChromeListItems.Bookmark key={e.id} entry={e} profile={profile} />
        ))}
      </List.Section>
    </List>
  );
}
