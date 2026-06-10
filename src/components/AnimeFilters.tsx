import { DocumentNode, gql, OperationVariables, TypedDocumentNode } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import slugify from 'slugify';

interface AnimeFiltersProps {
  query?: DocumentNode;
  label: string;
  filterType?: 'genre' | 'year' | 'season' | 'format' | 'airing-status';
  canSearch?: boolean;
  onValueChange?: (value: string | string[] | null) => void;
  isMulti?: boolean;
}

interface queryData {
  GenreCollection: [string],
}

export function AnimeFilters({ query, label, filterType, canSearch, onValueChange, isMulti }: AnimeFiltersProps) {

  const [value, setValue] = useState<any>(isMulti ? [] : null);
  const [isFocus, setIsFocus] = useState(false);

  const hasValue = isMulti ? value && value.length > 0 : value !== null;

  const seasons = [
    "Fall",
    "Summer",
    "Spring",
    "Winter"
  ];

  const formats = [
    "TV Show",
    "Movie",
    "TV Short",
    "Special",
    "OVA",
    "ONA",
    "Music"
  ];

  const airingStatuses = [
    "Airing",
    "Finished",
    "Not Yet Aired",
    "Cancelled"
  ]

  const EMPTY_QUERY = gql`query EmptyQuery {  }`;

  const renderLabel = () => {
    return (
      <Text>
        {label}
      </Text>
    );
  };

  const slug = (text: string) => {
    return slugify(text, {
      replacement: '-',
      lower: true
    });
  }

  const { data } = useQuery<queryData>(query || EMPTY_QUERY, {
    skip: !query || filterType !== 'genre'
  });

  const currentYear = new Date().getFullYear() + 1;

  const dataItems = useMemo(() => {
    if (filterType === 'genre' && data?.GenreCollection) {
      return data.GenreCollection.map((genre) => ({
        label: genre,
        value: slug(genre)
      }));
    }

    if (filterType === 'year') {
      return Array.from(
        { length: currentYear - 1940 + 1 },
        (_, i) => ({
          label: (currentYear - i).toString(),
          value: (currentYear - 1)
        })
      );
    }

    if (filterType === 'season') {
      return seasons.map((season) => ({
        label: season,
        value: slug(season)
      }));
    }

    if (filterType === 'format') {
      return formats.map((format) => ({
        label: format,
        value: slug(format)
      }));
    }

    if (filterType === 'airing-status') {
      return airingStatuses.map((status) => ({
        label: status,
        value: slug(status),
      }));
    }

    return [];
  }, [filterType, data]);

  const handleClear = () => {
    const resetValue = isMulti ? [] : null;
    setValue(resetValue);
    onValueChange?.(resetValue);
  };

  return (
    <View style={Styles.container}>
      {renderLabel()}
      {isMulti ? (
        <MultiSelect
          style={[Styles.multiselect, isFocus && { borderColor: 'blue' }]}
          placeholderStyle={Styles.placeholderStyle}
          selectedTextStyle={Styles.selectedTextStyle}
          inputSearchStyle={Styles.inputSearchStyle}
          iconStyle={Styles.iconStyle}
          data={dataItems}
          search={canSearch}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select"
          searchPlaceholder="Search..."
          value={value} // This expects an array: ['action', 'adventure']
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setValue(item);
            onValueChange?.(item);
          }}
          renderRightIcon={() => (
            hasValue ? (
              <Ionicons onPress={handleClear} name="close-outline" size={26} style={{ paddingLeft: 10 }} />
            ) : (
              <Ionicons name="chevron-down-outline" size={20} style={{ paddingLeft: 10 }} />
            )
          )}
        />
      ) : (
        <Dropdown
          style={[Styles.dropdown, isFocus && { borderColor: 'blue' }]}
          placeholderStyle={Styles.placeholderStyle}
          selectedTextStyle={Styles.selectedTextStyle}
          inputSearchStyle={Styles.inputSearchStyle}
          iconStyle={Styles.iconStyle}
          data={dataItems}
          search={canSearch}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select"
          searchPlaceholder="Search..."
          value={value}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setValue(item.value);
            setIsFocus(false);
            onValueChange?.(item.value);
          }}
          renderRightIcon={() => (
            hasValue ? (
              <Ionicons onPress={handleClear} name="close-outline" size={26} style={{ paddingLeft: 10 }} />
            ) : (
              <Ionicons name="chevron-down-outline" size={20} style={{ paddingLeft: 10 }} />
            )
          )}
        />
      )}
    </View>
  );
}

const Styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
  },
  multiselect: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
