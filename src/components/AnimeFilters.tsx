import { DocumentNode, gql, OperationVariables, TypedDocumentNode } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from 'react-native-element-dropdown';

interface AnimeFiltersProps {
  query?: DocumentNode;
  label: string;
  filterType?: 'genre' | 'year';
}

interface queryData {
  GenreCollection: [string],
}


export function AnimeFilters({ query, label, filterType }: AnimeFiltersProps) {

  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);

  const EMPTY_QUERY = gql`query EmptyQuery { __typename }`;

  const renderLabel = () => {
    return (
      <Text>
        {label}
      </Text>
    );
  };



  const { data } = useQuery<queryData>(query || EMPTY_QUERY, {
    skip: !query || filterType !== 'genre'
  });

  const currentYear = new Date().getFullYear() + 1;



  const dataItems = useMemo(() => {
    if (filterType === 'genre' && data?.GenreCollection) {
      return data.GenreCollection.map((genre) => ({
        label: genre,
        value: genre.toLowerCase()
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

    return [];
  }, [filterType, data]);



  return (
    <View style={Styles.container}>
      {renderLabel()}
      <Dropdown
        style={[Styles.dropdown, isFocus && { borderColor: 'blue' }]}
        placeholderStyle={Styles.placeholderStyle}
        selectedTextStyle={Styles.selectedTextStyle}
        inputSearchStyle={Styles.inputSearchStyle}
        iconStyle={Styles.iconStyle}
        data={dataItems}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder="Any"
        searchPlaceholder="Search..."
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          setValue(item.value);
          setIsFocus(false);
        }}
      />
    </View>
  );
}

const Styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
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
