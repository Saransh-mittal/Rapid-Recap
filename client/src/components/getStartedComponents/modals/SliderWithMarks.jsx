import React from 'react'
import {
  Box,
  Flex,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
} from '@chakra-ui/react'
import { getColorForLabel } from './utils/formState'

const SliderWithMarks = ({
  name,
  defaultValue,
  min,
  max,
  step,
  marks,
  formState,
  handleSliderChange,
}) => (
  <Box mb={4}>
    <Slider
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      width="80%"
      ml={'10%'}
      value={formState[name]}
      onChange={handleSliderChange(name)}
    >
      <SliderTrack>
        <SliderFilledTrack />
      </SliderTrack>
      <SliderThumb
        boxSize={4}
        _before={{
          content: '""',
          boxSize: '10px',
          borderRadius: 'full',
          bg: 'teal.500',
          filter: 'blur(4px)',
        }}
      />
    </Slider>
    <Flex justifyContent="space-between" mt={2}>
      {marks.map(mark => (
        <Text
          key={mark.value}
          fontSize="sm"
          width="20%"
          textAlign="center"
          color={getColorForLabel(mark.label)}
        >
          {mark.label}
        </Text>
      ))}
    </Flex>
  </Box>
)

export default SliderWithMarks
